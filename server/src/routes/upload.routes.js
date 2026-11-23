import path from 'node:path';
import crypto from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';

export const uploadRouter = Router();

const storage = multer.diskStorage({
  destination: config.paths.uploadsDir,
  filename: (_req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

uploadRouter.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Нужен файл в поле file' });
  res.status(201).json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname });
});
