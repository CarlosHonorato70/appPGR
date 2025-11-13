import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

app.listen(PORT, () => {
  console.log(\🚀 Server running on port \\);
});
