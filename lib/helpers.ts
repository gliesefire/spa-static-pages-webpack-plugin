import {
  statSync
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

export { isFolderExists, isFileExists };
