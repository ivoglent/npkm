import {BaseCommand} from "../command";
import {CommandInterface} from "../command.interface";

export class Help extends BaseCommand implements CommandInterface{
    run(): Promise<number> {
        return new Promise(((resolve, reject) => {
            console.log('Help');
            resolve(0);
        }));
    }

}
