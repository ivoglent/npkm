# npkm
Node package management - Another way to use git as private package

## Installation

``` 
npm i -g npkm
```

## Usage

Just like npm program. But if you want to use your git repository as a private package, modify project package.json 
and add some git config like:

```json
{
  "name": "npkm",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "async": "^2.6.0"
  },
  "gits": {
    "data-layer": "git@git.solazu.net:trading-platform/data-layer.git",
  },
  "author": "",
  "license": "ISC"
}

```

then : 

``` 
npkm i data-layer@latest
```

That's all!
