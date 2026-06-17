import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = resolve(__dirname, '../player-data.json');

export const readData = () => {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

export const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}
