import * as fs from 'fs-extra'
import { signal } from './signal';
import { confirmAction } from './prompts';

export function createFile(path: string, content: string, verbose = false) {
  try {
    fs.writeFileSync(path, content)
    if (verbose) {
      signal.succeed('File created')
    }
  } catch (error) {
    signal.fatal('Could not write file', error)
  }
}

export function createFileSafe(path: string, content: string, verbose = false): void {
  if (fs.existsSync(path)) {
    try {
      fs.copySync(path, `${path}.backup`)
      createFile(path, content, verbose)
    } catch (error) {
      signal.fatal('Could not create backup file', error)
    }
  } else {
    createFile(path, content, verbose)
  }
}
