import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import resultRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.use('/api', resultRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Voice Assistant Backend 🎦', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Voice assistant backend running on port ${PORT}`);
});
