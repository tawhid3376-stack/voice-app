import { useState, useRef, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.PROD
  ? 'https://voice-app-backend.onrender.com'
  : 'http://localhost:10000';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('haya_api_key') || '');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('���সা্ও নাররে কেতুন 🦤');
  const [phase, setPhase] = useState('idle');
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#]/g, '').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'bn-BD';
    u.rate = 0.92;
    u.pitch = 1.2;

    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(x => x.lang.startsWith('bn') && x.name.includes('Female'))
      || voices.find(x => x.lang.startsWith('bn'))
      || voices.find(x => x.lang === 'hi-IN' && x.name.includes('Female'))
      || voices[0];
    if (v) u.voice = v;

    synthRef.current = u;

    u.onstart = () => setPhase('speaking');
    u.onend = () => {
      setPhase('idle');
      setStatus('���সা্ও নাররে কেতুন 🦤');
      synthRef.current = null;
    };
    u.onerror = () => {
      setPhase('idle');
      setStatus('���সা্ও নাররে কেতুন 🦤');
      synthRef.current = null;
    };

    window.speechSynthesis.speak(u);
  }, []);

  const askGemini = useCallback(async (text) => {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, apiKey }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API error');
    return data.reply;
  }, [apiKey]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error('¼  ¦ £  ®     ¤¬  § ) Voice দৈপ্দেপিক §ঈ অ   ');
      return;
    }
    if (!apiKey) {
      toast.error(' ¦£  ¢p�² Settings গেছে Gemini API Key ¦)°p�      ');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      synthRef.current = null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'bn-BD';
    recognitionRef.current = rec;

    rec.onstart = () => {
      setPhase('listening');
      setStatus('👭ঘ্গে হমসিে়...');
    };

    rec.onresult = async (e) => {
      const text = e.results[0][0].transcript.trim();
      if (!text) {
        setPhase('idle');
        setStatus('কিছু সাক্঱রার পাওু <');
        return;
      }

      setMessages(prev => [...prev, { role: 'user', text }]);
      setPhase('thinking');
      setStatus('�dবাে সস্ভেনার...');

      try {
        const reply = await askGemini(text);
        setMessages(prev => [...prev, { role: 'jaya', text: reply }]);
        setStatus('');
        speak(reply);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'jaya', text: 'ফुকিখে৫়, আাও হয়েছে. আবার 高要前使覆下分.'}]);
        setPhase('idle');
        setStatus('“Error /@");
        toast.error(err.message);
      }
    };

    rec.onerror = (e) => {
      setPhase('idle');
      if (e.error === 'no-speech') setStatus('কিছু সাক্঱রার পাওু ᦆবার চার্ব করুন');
      else setStatus('Error: ' + e.error);
    };

    rec.onend = () => {
      if (synthRef.current) return;
      setPhase('idle');
    };

    rec.start();
  }, [SpeechRecognition, apiKey, askGemini, speak]);

  const stop = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      synthRef.current = null;
    }
    setPhase('idle');
    setStatus('���সা্ও নাররে কেতুন 🦤');
  }, []);

  const handleMic = () => {
    if (phase === 'idle') startListening();
    else stop();
  };

  const saveKey = () => {
    localStorage.setItem('haya_api_key', apiKey);
    toast.success('API Key সেজে পাওে ���র |!');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" toastOptions={{
        duration: 3000,
        style: { borderRadius: '12px', padding: '12px 16px', background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
      }} />

      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-in">
          <div className="text-6xl mb-3">{phase === 'listening' ? '🏧' : phase === 'thinking' ? '👤' : phase === 'speaking' ? '🤖' : '🤖'}</div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">ঊাগি</h1>
          <p className="text-gray-400 mt-1">AI Voice Assistant</p>
        </div>

        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className={`absolute inset-0 rounded-full bg-pink-500/20 pulse-ring ${phase !== 'idle' ? '' : 'hidden'}`} />
          <button
            onClick={handleMic}
            className={`w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all active:scale-90 ${phase !== 'idle' ? 'scale-105' : ''}`}
          >
            {phase === 'idle' ? '🦤' : phase === 'listening' ? '🏧' : '¯~🦀'=}
          </button>
        </div>

        <div className="text-center text-gray-400 mb-4 min-h[24px] text-sm">{status}</div>

        <div className="bg-gray-900 rounded-2xl p-4 mb-6 max-h-64 overflow-y-auto space-y-3 border border-gray-800" ref={el => { if (el) el.scrollTop = el.scrollHeight; }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-6">
              <p>👱 লাযরে আ়ার! আাও ক্পেকুম.</p>
              <p className="mt-1">ংাবারি঴বাররু আাও ক্পেকুম कরু আাওান হিক্তায অাট্঒োনৼে করুন!</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={@flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
              <div className={m.role === 'user'
                ? 'bg-pink-600/30 rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]'
                : 'bg-gray-800 rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%]'
              }>
                <p className="text-xs font-semibold mb-0.5 opacity-70">
                  {m.role === 'user' ? '         § ' : '©  ¥¢  § "}
                </p>
                <p className="text-sm text-white">{m.text}</p>
              </div>
            </div>
          ))}
          {phase === 'thinking' && (
            <div className="flex justify-start fade-in">
              <div className="bg-gray-800 rounded-2xl rounded-bl-md px-5 py-3">
                <span className="thinking-dot inline-block w-2 h-2 bg-purple-400 rounded-full mx-0.5" />
                <span className="thinking-dot inline-block w-2 h-2 bg-purple-400 rounded-full mx-0.5" />
                <span className="thinking-dot inline-block w-2 h-2 bg-purple-400 rounded-full mx-0.5" />
              </div>
            </div>
          )}
        </div>

        <div className={`flex items-center justify-center gap-1 mb-6 ${phase === 'listening' || phase === 'speaking' ? '' : 'invisible'}`}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="wave-bar w-1.5 bg-gradient-to-t from-pink-400 to-purple-400 rounded-full" />
          ))}
        </div>

        <details className="bg-gray-900 rounded-xl border border-gray-800">
          <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-300 select-none">♠️ Settings</summary>
          <div className="px-4 pb-4 space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <button onClick={saveKey} className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 rounded-lg text-sm font-semibold transition-colors">
              Save Key
            </button>
            <p className="text-xs text-gray-500 text-center">
              �a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-pink-400 hover:underline">
                ঠइব  Gemini Key প্ক্র্঳
              </a>
            </p>
          </div>
        </details>

        <p className="text-center text-xs text-gray-600 mt-6">
          Chrome / Edgeই Spacebar দ্পুর গূন ঢাওাবরু 🦤 নারু ঒ােপিক মুক বা঄
        </p>
      </div>
    </div>
  );
}

