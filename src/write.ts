import * as fs from 'fs-extra'

export function createFile(filepath: string, filecargo: string): void {
  try {
    // fs.accessSync(filepath)
    // let existingF = fs.readFileSync(filepath)
    // signale.debug('File exists. Do something?', existingF)
  } catch (error) {}
  return fs.writeFileSync(filepath, filecargo)
}
