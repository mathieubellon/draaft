import {CLIError} from '@oclif/errors'
import * as fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'
import {signal} from './signal'


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

export function createFile(filePath: string, content: string) {
    try {
        ensureDir(path.dirname(filePath))
        fs.writeFileSync(filePath, content)
    } catch (error) {
        signal.fatal('Could not write file', error)
        throw new CLIError(error)
    }
}

export function createFileSafe(filePath: string, content: string): void {
    if (fs.existsSync(filePath)) {
        try {
            fs.copySync(filePath, `${filePath}.backup`)
            createFile(filePath, content)
        } catch (error) {
            signal.fatal('Could not create backup file', error)
            throw new CLIError(error)
        }
    } else {
        createFile(filePath, content)
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
