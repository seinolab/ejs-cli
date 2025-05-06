import readline from 'readline';

/**
 * Fetches lines from stdin and invokes the callback with the result.
 * @param {any} stream - Unused in the current implementation, retained for compatibility.
 * @param {Function} [callback] - Callback to receive the joined input lines.
 */
const fetchStdio = (stream, callback = () => {}) => {
  const lines = [];

  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  reader.on('line', (line) => {
    lines.push(line);
  });

  process.stdin.on('end', () => {
    callback(null, lines.join('\n'));
  });
};

export default fetchStdio;
