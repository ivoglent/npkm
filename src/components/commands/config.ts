import {CommandInterface} from "../command.interface";
import {BaseCommand} from "../command";

export class Config  extends BaseCommand  implements CommandInterface {
    run(): Promise<number> {
        return undefined;
    }

}
