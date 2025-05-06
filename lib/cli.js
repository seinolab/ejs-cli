import fs from 'fs/promises';
import path from 'path';
import { parseArgs, styleText } from 'node:util'
import { glob } from 'glob'
import ejs from 'ejs';
import { load as parseYAML, YAMLException } from 'js-yaml';

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
    string: { type: 'string', short: 's' },
    json: { type: 'string', short: 'j' },
    yaml: { type: 'string', short: 'y' },
    env: { type: 'boolean' },
    config: { type: 'string', short: 'z' }
  },
  allowPositionals: true,
});

if (argv.help) {
  console.log(`Usage: ejs-cli [options] [file]
Options:
  -h, --help            Show help
  -f, --file FILE       EJS template file path or glob (positional, used if -f is omitted)
  -b, --base-dir DIR    Base directory (default: ./)
  -e, --exclude EXCL    Space-separated exclude patterns
  -o, --out DIR         Output directory (stdout if omitted)
  -s, --string JSON     Use a JSON string as data
  -j, --json FILE       Load data from a JSON file or stdin (use '-' for stdin)
  -y, --yaml FILE       Load data from a YAML file or stdin (use '-' for stdin)
      --env             Use environment variables as data
  -z, --config FILE     Load a JSON file as EJS compiler options. See https://ejs.co/#docs
  -O, --options OPTS    [Deprecated] Use a JSON string as data or load data from a JSON file
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
  if (verbose) console.error(styleText('green', `${tag}:\t${msg}`));
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
  return buffer.toString();
};

const loadFile = async (file) => {
  try {
    return file === '-' ? await readStdin() : await fs.readFile(file, 'utf-8');
  } catch {
    throw new Error(`fail to load file: ${file}`);
  }
};

const writeCompiled = async (result, srcPath) => {
  if (outDir) {
    let relativePath = srcPath?.replace(/\.ejs$/, '') || 'output.html';
    if (!/\.\w+$/.test(relativePath)) relativePath += '.html';
    relativePath = path.relative(baseDir, relativePath);
    const dest = path.join(outDir, relativePath);
    log('output', dest);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, result, 'utf8');
  } else {
    log('output', 'STDOUT');
    console.log(result);
  }
};

const run = async () => {
  try {
    // Load data
    const data = await (async () => {
      if (argv.options) {
        if (await isFile(argv.options)) {
          log('data from JSON file', argv.options);
          return JSON.parse(await loadFile(argv.options));
        } else {
          log('data from JSON string', argv.options);
          return JSON.parse(argv.options);
        }
      } else if (argv.string) {
        log('data from JSON string', argv.string);
        return JSON.parse(argv.string);
      } else if (argv.json) {
        log('data from JSON file', argv.json);
        return JSON.parse(await loadFile(argv.json));
      } else if (argv.yaml) {
        log('data from YAML file', argv.yaml);
        return parseYAML(await loadFile(argv.yaml)) ?? {};
      } else if (argv.env) {
        log('data from environment variables', '');
        return process.env ?? {};
      } else {
        log('data', 'none');
        return {};
      }
    }) ();

    // Load EJS options
    const options = argv.config ? JSON.parse(await loadFile(argv.config)) : {};

    // Render templates
    if (!srcGlob) {
      const src = await readStdin();
      const result = ejs.render(src, data, options);
      await writeCompiled(result, null);
    } else {
      const srcPaths = await glob(path.join(baseDir, srcGlob), { ignore: excludes } );
      for (const srcPath of srcPaths) {
        const result = await ejs.renderFile(srcPath, data, options);
        await writeCompiled(result, srcPath);
      }
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('Fail to parse JSON:', err.message);
    } else if (err instanceof YAMLException) {
      console.error('Fail to parse YAML:', err.message);
    } else {
      console.error('Error:', err.message);
    }
  }
};

export default run;