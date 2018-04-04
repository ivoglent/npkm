import {Installer} from "../installer";
import {CommandInterface} from "../command.interface";
import {exec} from "child_process";
const spawn = require('child_process').spawn;
const fs = require('fs');
const os = require('os');
const async = require('async');
const path = require('path');
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
            //let cwd = process.cwd();
            //let modulePath =  path.join(cwd, 'node_modules');
            let localPath = path.join(this.cachePath, name);
            let self = this;
            this.clone(gitUri,localPath).then(function (result) {
                if (result) {
                    self.getReleasedTags(localPath).then((tags : string[]) => {
                        if (tags.length == 0) {
                            reject('No released tags found');
                        } else {
                            if (typeof (version) === 'undefined' || version === 'latest') {
                                version = tags[tags.length - 1];
                            }
                            self.installSpecifyVersion(localPath, name, version, command ? command : false).then(resolve, reject);
                        }
                    })
                } else {
                    console.error('Can not clone repository of:', name, result);
                    reject('Can not clone');
                }
            }, (error) => {
                console.error('Can not clone repository of:', name, error);
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
            let cwd = process.cwd();
            let args = [
                'clone',
                uri,
                dest
            ];
            if (fs.existsSync(dest)) {
                process.chdir(dest);
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
                process.chdir(cwd);
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
                    console.log('Current versions:', tags.join(','));
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
            let self = this;
            process.chdir(dest);
            console.log('Checking out version:', version);
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
                if (code === 0) {
                    self.updateDependencies(dest).then(function (result) {
                        if (result) {
                            //Read .npkm config to build this project
                           try {
                               let npkmJson = fs.readFileSync(path.join(dest, '.npkm'));
                               let npkmConfig = JSON.parse(npkmJson);
                               if (npkmConfig.build) {
                                   console.log('Start building from source...', npkmConfig.build);
                                   let buildTasks = [];
                                   for (let _command in npkmConfig.build) {
                                       try {
                                           console.log('Running building command :', _command, npkmConfig.build[_command].join(' '));
                                           buildTasks.push({
                                               command : _command,
                                               args : npkmConfig.build[_command]
                                           });
                                           console.log(buildTasks);
                                           async.eachLimit(buildTasks, 1, function (task, next) {
                                               let _proc = spawn(task.command, task.args);
                                               _proc.stdout.on('data', (data) => {
                                                   console.log(data.toString());
                                               });
                                               _proc.stderr.on('data', (data) => {
                                                   console.error(data.toString());
                                               });
                                               _proc.on('exit', (code) => {
                                                   next();
                                               });
                                           }, function (error, result) {
                                               if (error) {
                                                   console.error(error);
                                                   process.chdir(cwd);
                                                   reject(error);
                                               } else {
                                                   let modulePath = path.join(cwd , 'node_modules', name);
                                                   console.log('Built succeed, copying dist...');
                                                   exec('rm -rf ' + modulePath, (err, stdout, stderr) => {
                                                       if (err) {
                                                           console.error(err);
                                                       } else {
                                                           fs.mkdirSync(modulePath);
                                                           fs.chmodSync(modulePath, '0775');
                                                       }

                                                       npkmConfig.dist.forEach(function (dir) {
                                                           let dirPath = path.join(dest, dir);
                                                           let destDirPath = path.join(cwd , 'node_modules', name, dir);
                                                           console.log('Start copying ', dirPath, 'to', destDirPath, '...');
                                                           exec('cp -R ' + dirPath +' ' + destDirPath, (err, stdout, stderr) => {
                                                               if (err) {
                                                                   console.error(err);
                                                                   return;
                                                               }
                                                           });
                                                       });
                                                       process.chdir(cwd);
                                                       resolve(true);
                                                   });

                                               }
                                           });
                                       } catch (e) {
                                           console.log(e);
                                           reject(e);
                                       }
                                   }
                               } else {
                                   console.log('Copying dist...');
                                   npkmConfig.dist.forEach(function (dir) {
                                       let dirPath = path.join(dest, dir);
                                       let destDirPath = path.join(cwd , 'node_modules', name);
                                       console.log('Start copying ', dirPath, 'to', destDirPath, '...');
                                       exec('cp -R ' + dirPath +' ' + destDirPath, (err, stdout, stderr) => {
                                           if (err) {
                                               console.error(err);
                                               return;
                                           }
                                           console.log(`stdout: ${stdout}`);
                                           console.log(`stderr: ${stderr}`);
                                       });
                                   });
                                   process.chdir(cwd);
                                   resolve(true);
                               }
                           } catch (e) {
                               process.chdir(cwd);
                               reject(e);
                           }


                        } else {
                            process.chdir(cwd);
                            resolve(code === 0);
                        }
                    }, (error) => {
                        reject(error);
                    })
                } else {
                    reject('Failed to checkout version:' + version);
                }
            });
        }))
    }

    /**
     *
     * @param {string} dest
     * @returns {Promise<boolean>}
     */
    private updateDependencies(dest: string) : Promise<boolean> {
        return new Promise(((resolve, reject) => {
            try {
                let packageJson = fs.readFileSync(path.join(dest, 'package.json'));
                let packages = JSON.parse(packageJson);
                if (packages.dependencies) {
                    this.resolveDependencies(packages.dependencies).then(resolve, reject);
                }
            } catch (e) {
                reject(e);
            }
        }))
    }

}
