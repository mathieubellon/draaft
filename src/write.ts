import {CLIError} from '@oclif/errors'
import * as fs from 'fs-extra'
import * as path from 'path'
import {signal} from './signal'
const chalk = require('chalk')


const currentPath = process.cwd()
export const IMAGE_DIR = path.join(currentPath, 'static', 'img')

export function ensureDir(dirPath: string) : void{
    try {
        if ( !fs.existsSync(dirPath) ) {
            fs.ensureDirSync(dirPath)
            signal.created(`📁 ${dirPath}`)
        }
    } catch (error) {
        signal.fatal(`📁 ${dirPath} not created`)
        throw new CLIError(error)
    }
}

export function createFile(path: string, content: string) {
    try {
        fs.writeFileSync(path, content)
    } catch (error) {
        signal.fatal('Could not write file', error)
        throw new CLIError(error)
    }
}

export function createFileSafe(path: string, content: string): void {
    if (fs.existsSync(path)) {
        try {
            fs.copySync(path, `${path}.backup`)
            createFile(path, content)
        } catch (error) {
            signal.fatal('Could not create backup file', error)
            throw new CLIError(error)
        }
    } else {
        createFile(path, content)
    }
}

export function createContentFile(dirPath: string, fileName: string, content: string) : void {
    try {
        createFile(path.join(dirPath, fileName), content)
        signal.created(`📄 ${chalk.gray(dirPath)}${path.sep}${fileName}`)
    } catch (error) {
        signal.fatal(error)
        throw new CLIError(error)
    }
}

export function createImageFile(dirPath: string, imageName: string, axiosResponse: any) : void {
    try {
        ensureDir(dirPath)
        let writeStream = fs.createWriteStream(path.join(dirPath, imageName))
        axiosResponse.data.pipe(writeStream)
        signal.downloaded(`${chalk.gray(dirPath)}${path.sep}${imageName}`)
    } catch (error) {
        signal.fatal(error)
        throw new CLIError(error)
    }
}
