import {Installer} from "../installer";
import {CommandInterface} from "../command.interface";
const spawn = require('child_process').spawn;
const fs = require('fs');
const os = require('os');
export class RemoteInstaller extends Installer implements CommandInterface {
    run(name: string, version : string): Promise<number> {
        return new Promise(((resolve, reject) => {
            console.log('Begin git remote install');
            this.installPackage(name, version).then(resolve, reject);
        }));
    }

    /**
     *
     * @param {string} name
     * @param {string} version
     * @returns {Promise<number>}
     */
    private installPackage(name : string, version: string) : Promise<number> {
        return new Promise<number>(((resolve, reject) => {
            console.log('Begin install git package:', name, version);
            let gitUri = this.packages.gits[name];
            let command;
            if (typeof (gitUri) === 'object') {
                command = gitUri.command;
                gitUri = gitUri.uri;
            }
            let cwd = process.cwd();
            let modulePath =  require('path').join(cwd, 'node_modules');
            let localPath = require('path').join(modulePath, name);
            let self = this;
            this.clone(gitUri,localPath).then(function (result) {
                if (result) {
                    self.getReleasedTags(localPath).then((tags : string[]) => {
                        if (tags.length == 0) {
                            reject('No released tags found');
                        } else {
                            if (version === 'latest') {
                                version = tags[tags.length - 1];
                            }
                            self.installSpecifyVersion(localPath, name, version, command ? command : false).then(resolve, reject);
                        }
                    })
                } else {
                    console.error('Can not clone repository of:', name);
                    reject('Can not clone');
                }
            }, (error) => {
                console.error('Can not clone repository of:', name);
                reject(error);
            });
        }));
    }

    /**
     *
     * @param {string} uri
     * @param {string} dest
     * @returns {Promise<boolean>}
     */
    private clone(uri : string, dest : string) : Promise<boolean> {
        return new Promise(((resolve, reject) => {
            let args = [
                'clone',
                uri,
                dest
            ];
            if (fs.existsSync(dest)) {
                args = ['fetch'];
            }
            let proc = spawn('git', args);
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

    /**
     *
     * @param {string} dest
     * @returns {Promise<string[]>}
     */
    getReleasedTags(dest: string) : Promise<string[]> {
        return new Promise(((resolve, reject) => {
            try {
                let tags = [];
                let cwd = process.cwd();
                process.chdir(dest);
                let args = [
                    'tag',
                    '--list'
                ];
                let proc = spawn('git', args);
                let _data = '';
                proc.stdout.on('data', (data) => {
                    _data += data.toString();
                });
                proc.stderr.on('data', (data) => {
                    console.error(data.toString());
                });
                proc.on('exit', (code) => {
                    process.chdir(cwd);
                    tags = _data.trim().split("\n");
                    console.log('Current versions:', tags);
                    resolve(tags);
                });
            } catch (e) {
                reject(e);
            }
        }))
    }

    /**
     *
     * @param {string} dest
     * @param {string} name
     * @param {string} version
     * @param {boolean} command
     * @returns {Promise<any>}
     */
    installSpecifyVersion(dest: string, name: string, version : string, command: boolean = false): Promise<any> {
        return new Promise(((resolve, reject) => {
            let cwd = process.cwd();
            process.chdir(dest);
            let args = [
                'checkout',
                version
            ];
            let proc = spawn('git', args);
            proc.stdout.on('data', (data) => {
                console.log(data.toString());
            });
            proc.stderr.on('data', (data) => {
                console.error(data.toString());
            });
            proc.on('exit', (code) => {
                if (command) {
                    proc = spawn('npm', command);
                    proc.stdout.on('data', (data) => {
                        console.log(data.toString());
                    });
                    proc.stderr.on('data', (data) => {
                        console.error(data.toString());
                    });
                    proc.on('exit', (code) => {
                        process.chdir(cwd);
                        resolve(code === 0);
                    });
                } else {
                    process.chdir(cwd);
                    resolve(code === 0);
                }
            });
        }))

    }

}
