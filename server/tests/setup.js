import os from 'node:os';
import path from 'node:path';

// Тесты работают с временной базой и не трогают server/data/db.json
process.env.NODE_ENV = 'test';
process.env.DATA_FILE = path.join(os.tmpdir(), `humo-test-${process.pid}-${Date.now()}.json`);
process.env.AI_API_KEY = '';
