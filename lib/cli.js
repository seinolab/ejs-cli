import fs from 'fs/promises';
import path from 'path';
import { parseArgs } from 'util';
import { glob } from 'glob'
import { styleText } from 'node:util'
import ejs from 'ejs';
import yaml from "js-yaml";

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
    json: { type: 'string', short: 'j' },
    yaml: { type: 'string', short: 'y' },
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
  -j, --json OPTS       Load options from a JSON file or the standard input (specify '-')
  -y, --yaml FILE       Load options from a YAML file or the standard input (specify '-')
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
  if (verbose) console.log(styleText('green', `${tag}:\t${msg}`));
};

const isFile = async (file) => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};
const readStdin = async () => {
  const buffers = [];
  for await (const chunk of process.stdin) buffers.push(chunk);
  const buffer = Buffer.concat(buffers);
  const text = buffer.toString();
  return text;
};

const loadYAML = async (file) => {
  try {
    const src = file === '-' ? await readStdin() : await fs.readFile(file, 'utf-8');
    return yaml.load(src);
  } catch {
    throw new Error('fail to parse YAML file.');
  }
};

const loadJSON = async (file) => {
  try {
    const src = file === '-' ? await readStdin() : await fs.readFile(file, 'utf-8');
    return JSON.parse(src.replace(/\n/g, ''));
  } catch {
    throw new Error('fail to parse JSON file.');
  }
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
      if (await isFile(argv.options)) {
        log('opts', `"${argv.options}"`);
        try {
          options = await loadJSON(argv.options);
        } catch (err) {
          console.error('Error:', err.message);
        }
      } else {
        log('options', argv.options);
        try {
          options = JSON.parse(argv.options);
        } catch {
          throw new Error(`fail to parse options JSON.\n => ${argv.options}`);
        }
      }
    } else if (argv.json) {
      log('opts', `"${argv.json}"`);
      try {
        options = await loadJSON(argv.json);
      } catch (err) {
        console.error('Error:', err.message);
      }
    } else if (argv.yaml) {
      log('opts', `"${argv.yaml}"`);
      try {
        options = await loadYAML(argv.yaml);
      } catch (err) {
        console.error('Error:', err.message);
      }
    } else {
      log('opts', 'none');
    }

    // Resolve glob
    const srcPaths = await glob(path.join(baseDir, srcGlob), { ignore: excludes } );

    // Process each template
    if (!srcGlob) {
      const src = await readStdin();
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