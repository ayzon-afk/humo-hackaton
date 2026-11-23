import os from 'node:os';
import path from 'node:path';

// Тесты никогда не трогают рабочую базу из server/.env:
// по умолчанию — временный JSON-файл, с TEST_DATABASE_URL — своя схема в PostgreSQL на каждый файл тестов.
const unique = `${process.pid}_${Date.now()}`;
process.env.NODE_ENV = 'test';
process.env.DATA_FILE = path.join(os.tmpdir(), `humo-test-${unique}.json`);
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || '';
process.env.DATABASE_SCHEMA = process.env.TEST_DATABASE_URL ? `test_${unique}` : '';
process.env.AI_API_KEY = '';
