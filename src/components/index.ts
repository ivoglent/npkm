import {RemoteInstaller} from "./commands/remote.installer";
import {Cache} from "./commands/cache";
import {Install} from "./commands/install";
import {Config} from "./commands/config";
import {LocalInstaller} from "./commands/local.installer";
import {Help} from "./commands/help";

export const commands = {
    install : Install,
    config : Config,
    cache : Cache,
    localInstall : LocalInstaller,
    remoteInstall : RemoteInstaller,
    help: Help
};
