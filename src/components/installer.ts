import {BaseCommand} from "./command";
import * as os from "os";
import {spawn} from "child_process";
const fs = require('fs');
const async = require('async');
export abstract class Installer  extends BaseCommand {
    cachePath : string;
    constructor(protected param, protected packages : any, protected options) {
        super(param, packages, options);
        this.cachePath = require('path').join(os.homedir(), '.npkm');
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, 777);
            fs.chmodSync(this.cachePath, '0777');
        }
    }

    /**
     *
     * @param dependencies
     * @returns {Promise<boolean>}
     */
    public resolveDependencies(dependencies : any) : Promise<boolean> {
        return new Promise(((resolve, reject) => {
            let args = ['i'];
            for(let name in dependencies) {
                let version = dependencies[name];
                args.push(name + '@' + version);
            }
            let proc = spawn('npm', args);
            proc.stdout.on('data', (data) => {
                console.log(data.toString());
            });
            proc.stderr.on('data', (data) => {
                console.error(data.toString());
            });
            proc.on('exit', (code) => {
                resolve(code === 0);
            });
        }))
    }
}
