# npkm
Node package management - Another way to use git as private package

## Installation

``` 
npm i -g npkm
```

> Note : You should add ssh key for authentication. Example : [https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/)

## Usage

### Setting in your git repository
Add npkm config file to the root directory of your project.

Filename : `.npkm`

Example content :

``` 
{
	"build" : {
		"gulp" : ["scripts", "--env", "production"]
	},
	"dist" : ["./dist"]
}
```

- Build command `build` : Command to build from source. Such as `"npm" : "build'`
- Dist folders `dist` : List of folders which you want to locate in `node_modules`


### Setting in your project
 
Just like npm program. But if you want to use your git repository as a private package, modify project package.json 
and add some git config like:

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
