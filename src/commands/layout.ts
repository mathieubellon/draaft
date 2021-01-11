import { Command, flags } from "@oclif/command"
import { CLIError } from "@oclif/errors"
import * as fs from "fs"
import { ensureDirSync } from "fs-extra"
import * as path from "path"
import { signal } from "../signal"

export default class Layout extends Command {
    static description = "Create basic layout to display content"

    static flags = {
        help: flags.help({ char: "h" }),
        // flag with a value (-n, --name=VALUE)
        ssg: flags.string({ char: "s", description: "Static site generator" }),
        // flag with no value (-f, --force)
        overwrite: flags.boolean({ char: "f", default: false }),
    }

    async run() {
        //const {args, flags} = this.parse(Layout)
        const CURR_DIR = process.cwd()
        const templatePath = path.join(__dirname, "../", "templates", "hugo")

        function createDirectoryContents(templatePath: string, CURR_DIR: string) {
            const filesToCreate = fs.readdirSync(templatePath)
            filesToCreate.forEach((file) => {
                const origFilePath = `${templatePath}/${file}`
                // get stats about the current file
                const stats = fs.statSync(origFilePath)
                if (stats.isFile()) {
                    const contents = fs.readFileSync(origFilePath, "utf8")
                    //console.log('reader', contents)
                    const writePath = `${CURR_DIR}/${file}`
                    try {
                        fs.writeFileSync(writePath, contents, "utf8")
                        signal.created(`📄 ${writePath}`)
                    } catch (error) {
                        signal.fatal(error)
                        throw new CLIError(error)
                    }
                } else if (stats.isDirectory()) {
                    try {
                        ensureDirSync(`${CURR_DIR}/${file}`)
                        signal.created(`📁 ${CURR_DIR}/${file}`)
                    } catch (error) {
                        signal.fatal(error)
                        throw new CLIError(error)
                    }
                    // recursive call
                    createDirectoryContents(`${templatePath}/${file}`, `${CURR_DIR}/${file}`)
                }
            })
        }

        createDirectoryContents(templatePath, CURR_DIR)
        // function createProject(projectPath: string) {
        //     if (fs.existsSync(projectPath)) {
        //         console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
        //         return false;
        //     }    fs.mkdirSync(projectPath);
        //     return true;
        // }
    }
}
