import fs from 'fs/promises';
import path from 'path';
import { parseArgs } from 'util';
import glob from 'glob';
import chalk from 'chalk';
import ejs from 'ejs';

import fetchStdio from './fetchStdio.js';
import { parseOptionsFile } from './parseOptionsFile.js';

const {
  values: argv,
  positionals,
} = parseArgs({
  options: {
    help: { type: 'boolean', short: 'h' },
    file: { type: 'string', short: 'f' },
    'base-dir': { type: 'string', short: 'b', default: './' },
    exclude: { type: 'string', short: 'e' },
    out: { type: 'string', short: 'o' },
    options: { type: 'string', short: 'O' },
  },
  allowPositionals: true,
});

if (argv.help) {
  console.log(`Usage: node cli.js [options] [file]
Options:
  -h, --help            Show help
  -f, --file FILE       EJS template file path or glob
  -b, --base-dir DIR    Base directory (default: ./)
  -e, --exclude EXCL    Space-separated exclude strings
  -o, --out DIR         Output directory (prints to stdout if omitted)
  -O, --options OPTS    Options as JSON string or file path
`);
  process.exit(0);
}

const srcGlob = argv.file || positionals[0];
const baseDir = argv['base-dir'];
const outDir = argv.out || null;
const verbose = !!outDir;
const excludes = argv.exclude?.split(' ') ?? [];
const optionsArg = argv.options || null;

const log = (tag, msg) => {
  if (verbose) console.log(chalk.green(`${tag}:\t${msg}`));
};

const writeCompiled = async (result, srcPath) => {
  if (outDir) {
    let relativePath = srcPath?.replace(/\.ejs$/, '') || 'output.html';
    if (!/\.\w+$/.test(relativePath)) relativePath += '.html';
    relativePath = path.relative(baseDir, relativePath);
    const dest = path.join(outDir, relativePath);
    log('output', `"${dest}"`);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, result, 'utf8');
  } else {
    log('output', 'STDOUT');
    console.log(result);
  }
};

const run = async () => {
  try {
    // Load options
    let options = {};
    if (argv.options) {
      if (await fs.stat(argv.options)) {
        log('opts', `"${argv.options}"`);
        options = await new Promise((resolve, reject) => {
          parseOptionsFile(argv.options, (err, opts) => {
            if (err) reject(err);
            else resolve(opts);
          });
        });
      } else {
        log('options', argv.options);
        try {
          options = JSON.parse(argv.options);
        } catch {
          throw new Error(`fail to parse options JSON.\n => ${argv.options}`);
        }
      }
    } else {
      log('opts', 'none');
    }

    // Resolve glob
    const srcPaths = await new Promise((resolve, reject) => {
      glob(path.join(baseDir, srcGlob), (err, matches) => {
        if (err) return reject(err);
        const filtered = excludes
          ? matches.filter(file => excludes.every(ex => !file.includes(ex)))
          : matches;
        resolve(filtered);
      });
    });

    // Process each template
    if (!srcGlob) {
      const src = await new Promise((resolve, reject) => {
        fetchStdio(null, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      const result = ejs.render(src, options);
      await writeCompiled(result, null);
    } else {
      for (const srcPath of srcPaths) {
        const result = await ejs.renderFile(srcPath, options);
        await writeCompiled(result, srcPath);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

export default run;