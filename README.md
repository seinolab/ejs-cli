ejs-cli
=======

Command-line EJS compiler.

New features and enhancements:
- rewrite in ES6
- remove dependencies `async`, `chalk`, `mkdirp`, and `yargs`.
- `--json` option to load data from a JSON file or stdin.
- `--yaml` option to load data from a YAML file or stdin.
- `--env` option to use environment variables as data.
- `--string` option to pass data in a JSON string.
- `--config` options to load a JSON file as [EJS compiler options](https://ejs.co/#docs).
- If a JSON error occurs, `ejs-cli` will display a detailed error message returned by the JSON parser.

## Installation

### From npm

```
npm -g install git@github.com:seinolab/ejs-cli.git
```

### From github

```
git clone git://github.com/fnobi/ejs-cli.git
```

## Usage

```
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
```

### examples

Renders `template.ejs` using data from `data.json`, and writes the output to `output.html`:

```bash
ejs-cli template.ejs --json data.json > output.html
```

Renders `template.ejs` using inline JSON data passed as a string:

```bash
ejs-cli template.ejs --string '{ "stamp": "2025-05-10" }' > output.html
```

Renders `template.ejs` using data loaded from `data.yaml`:

```bash
ejs-cli template.ejs --yaml data.yaml > output.html
```

Reads YAML data from stdin and renders `template.ejs`. The `-` tells `ejs-cli` to read from stdin:

```bash
cat data.yaml | ejs-cli template.ejs --yaml - > output.html
```

Passes environment variable `STAMP` to the template using the `--env` option. Useful for dynamic data like timestamps:

```bash
STAMP=`date +%Y-%m-%d` ejs-cli template.ejs --env > output.html
```

Renders all `.ejs` files in the current directory using `data.json`, and writes the compiled files to the `dest/` directory:

```bash
ejs-cli "*.ejs" --out dest/ --json data.json
```

Renders all `.ejs` files in the `src/` directory using `data.json`, and outputs the result to `dest/`:

```bash
ejs-cli --base-dir src/ "*.ejs" --out dest/ --json data.json
```

Recursively renders all `.ejs` files under `src/` and subdirectories, using `data.json`, and writes them to `dest/`:

```bash
ejs-cli --base-dir src/ "**/*.ejs" --out dest/ --json data.json
```

Renders all `.ejs` files under `src/` except those in any `partials` subdirectory, using `data.yaml` for data, and outputs to `dest/`:

```bash
ejs-cli --base-dir src/ "**/*.ejs" --exclude "**/partials/**" --out dest/ --yaml data.yaml
```

Note: Always quote glob patterns (e.g. `"**/*.ejs"``) to prevent the shell from expanding them before `ejs-cli` can process them.  This is especially important for recursive patterns.
