ejs-cli
=======

ejs compile client.

new features:
- rewrite in ES6
- remove dependencies `async`, `chalk`, `mkdirp`, and `yargs`.
- `--json` option to load option variables from JSON file or standard input
- `--yaml` option to load option variables from YAML file or standard input

## install

### from npm

```
npm -g install git@github.com:seinolab/ejs-cli.git
```

### from github

```
git clone git://github.com/fnobi/ejs-cli.git
```

## usage

```
Options:
  -h, --help          show this help.                               [boolean]  [default: false]
  -f, --file FILE     give ejs template file path.                  [string]
  -b, --base-dir DIR  base directory that -f is relative to.        [string]  [default: "./"]
  -e, --exclude EXCL  file/directory names to exclude               [string] [space separated if more than one]
  -o, --out DIR       file to write compiled.                       [string]
  -O, --options OPTS  option variables (file path or JSON string).  [string]
  -j, --json FILE     load option variables from a JSON file or stdin (specify '-')
  -y, --yaml FILE     load option variables from a YAML file or stdin (specify '-')
```

### examples

```bash
ejs-cli template.ejs --json data.json > output.html
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
