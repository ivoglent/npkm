#!/usr/bin/env node
import {CommandInterface} from "./components/command.interface";
import {commands} from "./components";

let command : any;
let options = [];
//parse args
(function () {
    let args = process.argv.slice(2);
    for(let i = 0; i < args.length; i += 2) {
        if (args[i].indexOf('--') < 0) {
            command =  {
                command : args[i],
                params : args[i+1]
            };
        } else  {
            options.push({
                option :  args[i].replace('--', ''),
                params : args[i+1]
            })
        }

    }
})();

//Current dir
const WK_DIR = process.cwd();
const fs = require('fs');
let _package;
//Read package.json
let pkCfg = fs.readFileSync(require('path').join(WK_DIR, 'package.json'));
try {
    _package = JSON.parse(pkCfg);

} catch (e) {
    console.error(e.message);
    process.exit(1);
}

if (!command.command) {
    command.command = 'help';
}
switch (command.command) {
    case 'i' :
        command.command = 'install';
        break;
    case 'li' :
        command.command = 'localInstall';
        break;
    case 'ri' :
        command.command = 'remoteInstall';
        break;
}
if (commands[command.command]) {
    let commandName = commands[command.command];
    let commandInstance: CommandInterface = new commandName(command.params, _package, options);
    commandInstance.run().then(function (code) {
        process.exit(code);
    }).catch(function (error) {
        console.error(error);
        process.exit(1);
    });
} else {
    console.error('Command does not support:', command.command);
    process.exit(1);
}
