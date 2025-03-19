import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Текущая директория:', process.cwd());
console.log('Директория скрипта:', __dirname);

// Пробуем разные способы загрузки .env
console.log('\n1. Прямая загрузка:');
const result1 = dotenv.config();
console.log('Результат:', result1);
console.log('BOT_TOKEN:', process.env.BOT_TOKEN);

console.log('\n2. Загрузка с указанием пути:');
const result2 = dotenv.config({ path: join(__dirname, '.env') });
console.log('Результат:', result2);
console.log('BOT_TOKEN:', process.env.BOT_TOKEN);

console.log('\n3. Чтение файла напрямую:');
import fs from 'fs';
const envContent = fs.readFileSync(join(__dirname, '.env'), 'utf8');
console.log('Содержимое файла:', envContent); 