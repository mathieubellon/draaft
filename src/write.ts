import * as fs from 'fs-extra';

export function createFolder(hierarchy: string): Promise<void> {
  console.log(`Ensure ${hierarchy} exists (create if not)`)
  return fs.ensureDir(hierarchy) // dir has now been created, including the directory it is to be placed in
}

export function createFile(filepath: string, filecargo: string): void {
  fs.ensureFile(filepath)
    .then(() => {
      fs.writeFile(filepath, filecargo)
        .then(() => {
          console.log('File successfully write' + filepath)
        }).catch(error => {
          console.error('File write error' + filepath + error)
        })
    })
    .catch(err => {
      console.error(err)
    })
}
