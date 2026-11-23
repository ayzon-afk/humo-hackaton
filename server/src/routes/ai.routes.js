import { Router } from 'express';
import multer from 'multer';
import { chat, analyze, vision } from '../services/ai.service.js';

export const aiRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

aiRouter.post('/chat', async (req, res) => res.json(await chat(req.body || {})));

aiRouter.post('/analyze', async (req, res) => {
  const { text, instruction = 'Определи category, priority (1-5), summary и tags.' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Нужен text' });
  res.json(await analyze({ text, instruction }));
});

aiRouter.post('/vision', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Нужно фото в поле image' });
  const prompt = req.body.prompt || 'Опиши, что на фото: label, description, confidence (0-1).';
  res.json(
    await vision({ imageBase64: req.file.buffer.toString('base64'), mimeType: req.file.mimetype, prompt }),
  );
});
