import {BaseCommand} from "./command";
import * as os from "os";
const fs = require('fs');
export abstract class Installer  extends BaseCommand {
    cachePath : string;
    constructor(protected param, protected packages : any, protected options) {
        super(param, packages, options);
        this.cachePath = require('path').join(os.homedir(), '.npkm');
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, 777);
        }
    }
}
