import { access, readFile } from 'fs/promises';
import { extname } from 'path';

/**
 * JSONファイルを読み込んでオプションオブジェクトとして返す
 * @param {string} filepath 
 * @param {(err: Error|null, options?: object) => void} callback 
 */
export async function parseOptionsFile(filepath, callback = () => {}) {
    let options = {};

    try {
        await access(filepath);

        if (extname(filepath) !== '.json') {
            throw new Error(`"${filepath}" is invalid file format.`);
        }

        const src = await readFile(filepath, 'utf8');
        options = JSON.parse(src.replace(/\n/g, ''));

        callback(null, options);
    } catch (err) {
        callback(err);
    }
}