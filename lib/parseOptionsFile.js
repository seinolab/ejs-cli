import { access, readFile } from 'fs/promises';
import { extname } from 'path';
import yaml from "js-yaml";

/**
 * JSONファイルを読み込んでオプションオブジェクトとして返す
 * @param {string} filepath 
 * @param {(err: Error|null, options?: object) => void} callback 
 */
export async function parseOptionsFile(filepath) {
    await access(filepath);

    if (extname(filepath) === '.json') {
        try {
            const src = await readFile(filepath, 'utf8');
            return JSON.parse(src.replace(/\n/g, ''));
        } catch {
            throw new Error('fail to parse JSON file.');
        }
    } else if (extname(filepath) === '.yaml') {
        try {
            const src = await readFile(filepath, 'utf8');
            return yaml.load(src)
        } catch {
            throw new Error('fail to parse YAML file.');
        }
    } else {
        throw new Error(`"${filepath}" is invalid file format.`);         
    }
 
 }