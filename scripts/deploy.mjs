// npm run deploy                 → коммит "update HH:MM" + push на GitHub + деплой на Railway
// npm run deploy -- "сообщение"   → то же самое, но со своим сообщением коммита
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const message = process.argv.slice(2).join(' ') || `update ${time}`;

run('git add -A');
if (out('git status --porcelain')) {
  run(`git commit -m "${message.replace(/"/g, "'")}"`);
} else {
  console.log('ℹ️  Новых изменений нет — просто передеплою текущую версию');
}

try {
  run('git push');
} catch {
  console.log('⚠️  git push не прошёл (нет интернета?) — продолжаю деплой на Railway');
}

console.log('🚀 Заливаю на Railway...');
run('railway up --detach --service humo-hackaton');
console.log('✅ Готово! Через 1–2 минуты: https://humo-hackaton-production.up.railway.app');
console.log('   Статус сборки: railway deployment list');
