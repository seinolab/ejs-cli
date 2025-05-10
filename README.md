ejs-cli
=======

Command-line EJS compiler.

New features:
- rewrite in ES6
- remove dependencies `async`, `chalk`, `mkdirp`, and `yargs`.
- `--json` option to load variables from a JSON file or standard input.
- `--yaml` option to load variables from a YAML file or standard input.
- `--string` option to pass variables with a JSON string.

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
  -s, --string JSON     Pass variables as a JSON string
  -j, --json FILE       Load variables from a JSON file or stdin (use '-' for stdin)
  -y, --yaml FILE       Load variables from a YAML file or stdin (use '-' for stdin)
  -O, --options OPTS    [Deprecated] Options as a JSON string or file path
```

### examples

```bash
ejs-cli template.ejs --json data.json > output.html
```

```bash
ejs-cli template.ejs --string '{ "stamp": "2025-05-10" }' > output.html
```

```bash
ejs-cli template.ejs --yaml data.yaml > output.html
```

```bash
cat data.yaml | ejs-cli template.ejs --yaml - > output.html
```

```bash
ejs-cli "*.ejs" --out dest/ --options options.json
# renders the *.ejs files in the current working directory and outputs compiled files to dest/
```

```bash
ejs-cli --base-dir src/ "*.ejs" --out dest/
# renders the *.ejs files in src/ and outputs compiled files to dest/
```

```bash
ejs-cli --base-dir src/ "**/*.ejs" --out dest/
# renders the *.ejs files in src/ and its subdirectories and outputs compiled files to dest/
```

Make sure to quote the file pattern, otherwise, your shell will expand it before it is passed to ejs-cli.
This behaviour would prevent ejs-cli from walking down the tree in this latest exemple.

```bash
ejs-cli --base-dir src/ "**/*.ejs" --exclude "partials/" --out dest/
# exclude any "partials" directory from rendering
```

```bash
cat example.ejs | ejs-cli example.ejs > example.html
```
