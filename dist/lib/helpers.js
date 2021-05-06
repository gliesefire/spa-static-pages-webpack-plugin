"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileExists = exports.createFileP = exports.mkdirP = exports.isFolderExists = void 0;
var fs_1 = require("fs");
function isFolderExists(path) {
    try {
        var stat = fs_1.statSync(path);
        return stat.isDirectory();
    }
    catch (err) {
        // if it's simply a not found error
        if (err.code === "ENOENT") {
            return false;
        }
        //otherwise throw the error
        throw err;
    }
}
exports.isFolderExists = isFolderExists;
function isFileExists(path) {
    try {
        var stat = fs_1.statSync(path);
        return stat.isFile();
    }
    catch (err) {
        // if it's simply a not found error
        if (err.code === "ENOENT") {
            return false;
        }
        //otherwise throw the error
        throw err;
    }
}
exports.isFileExists = isFileExists;
var mkdirP = function (dir, opts) {
    return new Promise(function (resolve, reject) {
        if (!isFolderExists(dir))
            fs_1.mkdir(dir, opts, function (err, createdPath) {
                return err === null ? resolve(createdPath) : reject(err);
            });
        else
            resolve(dir);
    });
};
exports.mkdirP = mkdirP;
var createFileP = function (path, data, options) {
    if (options === void 0) { options = null; }
    return new Promise(function (resolve, reject) {
        fs_1.writeFile(path, data, options, function (err) {
            return err === null ? resolve(path) : reject(err);
        });
    });
};
exports.createFileP = createFileP;
//# sourceMappingURL=helpers.js.map