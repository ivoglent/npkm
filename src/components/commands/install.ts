import {CommandInterface} from "../command.interface";
import {BaseCommand} from "../command";
import {NpmInstaller} from "./npm.installer";
import {RemoteInstaller} from "./remote.installer";
const async = require('async');
export class Install  extends BaseCommand  implements CommandInterface{
    run(): Promise<number> {
        return new Promise<number>(((resolve, reject) => {
            let packageName = this.param;
            if (packageName) {
                let version = 'latest';
                if (packageName.indexOf('@') >= 0) {
                    let ps =packageName.split('@');
                    packageName = ps[0];
                    version = ps[1];
                }
                if (this.packages.gits && this.packages.gits[packageName]) {
                    //Git install
                    this.git(packageName, version).then((code) => {
                        resolve(code);
                    }, (error) => {
                        reject(error);
                    })
                } else {
                    //Npm install
                    this.npm(packageName, version).then(resolve).catch(reject);
                }
            } else {
                let self = this;
                async.parallel([
                    function (next) {
                        let _pks = [];
                        if (self.packages.gits) {
                           for(let name in self.packages.gits) {
                               _pks.push({
                                   name : name,
                                   version : 'latest'
                               });
                           }
                        }
                        async.eachLimit(_pks, 1, function (pk, _next) {
                            self.git(pk.name, pk.version).then(function (code) {
                                _next();
                            }, function (error) {
                                console.log(error);
                                _next();
                            });
                        }, function (error, results) {
                            if (error) {
                                console.error(error);
                            }
                            next();
                        });

                    },
                    function (next) {
                        self.npm().then(next).catch(next);
                    }
                ], function (errors, results) {
                    if (errors) {
                        console.log(errors);
                    }
                    resolve(0);
                })
            }
        }));
    }

    /**
     *
     * @param packageName
     * @param version
     * @returns {Promise<any>}
     */
    private npm(packageName: string = undefined, version : string = undefined): Promise<number> {
        return new Promise(((resolve, reject) => {
            let installer = new NpmInstaller(this.param, this.packages, this.options);
            let self = this;
            installer.run().then(function (code) {
                if (code === 0) {
                    self.options.forEach(function (option) {
                        if (option.option === 'save') {
                            self.packages.dependencies[packageName] = version;
                        }
                    });
                }
                resolve(code);
            }, function (error) {
                reject(error);
            })
        }))
    }


    /**
     *
     * @param {string} packageName
     * @param {string} version
     * @returns {Promise<any>}
     */
    private git(packageName: string = undefined, version : string = undefined): Promise<number> {
        return new Promise(((resolve, reject) => {
            let installer = new RemoteInstaller(this.param, this.packages, this.options);
            let self = this;
            installer.run(packageName, version).then(function (code) {
                if (code === 0) {
                    self.options.forEach(function (option) {
                        if (option.option === 'save') {
                            self.packages.dependencies[packageName] = version;
                        }
                    });
                }
                resolve(code);
            }, function (error) {
                reject(error);
            })
        }));
    }
}
