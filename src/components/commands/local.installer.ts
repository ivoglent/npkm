import {Installer} from "../installer";
import {CommandInterface} from "../command.interface";

export class LocalInstaller extends Installer implements CommandInterface{
    run(): Promise<number> {
        return new Promise(((resolve, reject) => {

        }));
    }

}
