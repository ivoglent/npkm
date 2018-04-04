# npkm
Node package management - Another way to use git as private package

## Installation

``` 
npm i -g npkm
```

## Usage

Just like npm program. But if you want to use your git repository as a private package, modify project package.json 
and add some git config like:

> Note : You should add ssh key for authentication. Example : [https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/)

```json
{
  "name": "npkm",
  "version": "1.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "async": "^2.6.0"
  },
  "gits": {
    "data-layer": "git@githost.com:projects/data-layer.git"
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
