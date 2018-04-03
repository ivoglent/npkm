import {Installer} from "../installer";
import {CommandInterface} from "../command.interface";
const spawn = require('child_process').spawn;
const async = require('async');
export class NpmInstaller extends Installer implements CommandInterface{
    run(): Promise<number> {
        return new Promise(((resolve, reject) => {
            try {
                if (this.param) {
                    this.installPackage(this.param).then(resolve, reject);
                } else {
                    let pks = [];
                    for(let name in this.packages.dependencies) {
                        let version  = this.packages.dependencies[name];
                        pks.push({
                            name : name,
                            version : version
                        })
                    }
                    for(let name in this.packages.devDependencies) {
                        let version  = this.packages.devDependencies[name];
                        pks.push({
                            name : name,
                            version : version
                        });
                    }
                    let self = this;
                    async.eachLimit(pks, 1, function (pk, next) {
                        self.installPackage(pk.name + '@' + pk.version).then(next).catch(next);
                    }, function (errors, results) {
                        resolve(0);
                    })
                }
            } catch (e) {
                reject(e);
            }
        }));
    }

    /**
     *
     * @param {string} packageNameAndVersion
     * @returns {Promise<number>}
     */
    installPackage(packageNameAndVersion : string = undefined) : Promise<number> {
        return new Promise(((resolve, reject) => {
            try {
                console.log('Installing package:', packageNameAndVersion);
                let args = [
                    'i',
                    packageNameAndVersion
                ];
                if (!packageNameAndVersion) {
                    args = ['i'];
                }
                let proc = spawn('npm', args);
                proc.stdout.on('data', (data) => {
                    console.log(data.toString());
                });
                proc.stderr.on('data', (data) => {
                    console.error(data.toString());
                });
                proc.on('exit', (code) => {
                    resolve(code);
                });
            } catch (e) {
                reject(e);
            }
        }))
    }
}
