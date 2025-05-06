import readline from 'readline';

/**
 * Reads from stdin and returns a Promise that resolves with the combined input as a string.
 * @param {any} stream - Unused in the current implementation, retained for compatibility.
 * @returns {Promise<string>}
 */
const fetchStdio = (stream) => {
  return new Promise((resolve, reject) => {
    const lines = [];

    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    reader.on('line', (line) => {
      lines.push(line);
    });

    process.stdin.on('end', () => {
      resolve(lines.join('\n'));
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
};

export default fetchStdio;
