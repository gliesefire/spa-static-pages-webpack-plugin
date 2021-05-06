import {
  statSync,
  mkdir,
  WriteFileOptions,
  writeFile,
  MakeDirectoryOptions,
} from "fs";

function isFolderExists(path: string) {
  try {
    const stat = statSync(path);
    return stat.isDirectory();
  } catch (err) {
    // if it's simply a not found error
    if (err.code === "ENOENT") {
      return false;
    }
    //otherwise throw the error
    throw err;
  }
}

function isFileExists(path: string) {
  try {
    const stat = statSync(path);
    return stat.isFile();
  } catch (err) {
    // if it's simply a not found error
    if (err.code === "ENOENT") {
      return false;
    }
    //otherwise throw the error
    throw err;
  }
}

const mkdirP = function (dir: string, opts: MakeDirectoryOptions) {
  return new Promise((resolve, reject) => {
    if (!isFolderExists(dir))
      mkdir(dir, opts, (err: Error, createdPath: string) =>
        err === null ? resolve(createdPath) : reject(err)
      );
    else resolve(dir);
  });
};

const createFileP = function (
  path: string,
  data: string,
  options: WriteFileOptions = null
) {
  return new Promise((resolve, reject) => {
    writeFile(path, data, options, (err: Error) =>
      err === null ? resolve(path) : reject(err)
    );
  });
};

export { isFolderExists, mkdirP, createFileP, isFileExists };
