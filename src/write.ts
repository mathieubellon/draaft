import * as fs from 'fs-extra'

export function createFolder(hierarchy: string): Promise<void> {
  return fs.ensureDir(hierarchy) // dir has now been created, including the directory it is to be placed in
}

export function createFile(filepath: string, filecargo: string): void {
  try {
    // fs.accessSync(filepath)
    // let existingF = fs.readFileSync(filepath)
    // signale.debug('File exists. Do something?', existingF)
  } catch (error) {}
  return fs.writeFileSync(filepath, filecargo)
}
