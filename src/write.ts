import * as fs from 'fs-extra';

export function createFolder(hierarchy: string): Promise<void> {
  return fs.ensureDir(hierarchy) // dir has now been created, including the directory it is to be placed in
}

export function createFile(filepath: string, filecargo: string): Promise<void> {
  fs.ensureFile(filepath)
    .then(() => {})
    .catch(err => {
      console.error(err)
    })
  return fs.writeFile(filepath, filecargo)
}
