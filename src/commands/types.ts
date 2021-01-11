import { flags } from "@oclif/command"
import * as yaml from "js-yaml"
import * as path from "path"
import chalk from "chalk"
import { BaseCommand } from "../base"
import { signal } from "../signal"
import { createFile, createFileSafe } from "../write"

export default class Types extends BaseCommand {
    static description = "List all item types"

    static flags = {
        help: flags.help({ char: "h" }),
        // flag with no value (-f, --force)
        schema: flags.boolean({ char: "w", description: "Display content schema for each type" }),
        save: flags.boolean({
            char: "s",
            description: "Save content shema as file for customisation",
        }),
        backup: flags.boolean({ char: "b", description: "If file exists create backup" }),
    }

    static args = [{ name: "id", description: "ID of type", required: false }]

    purgeType(srcType: any) {
        let purgedType: any = {}
        purgedType.id = srcType.id
        purgedType.name = srcType.name
        purgedType.content_schema = {}

        srcType.content_schema.forEach((element: any) => {
            let neovalue: any = {}

            neovalue.fm_show = true
            neovalue.fm_key = element.name
            if (element.name === "body") {
                neovalue.fm_show = false
            }
            purgedType.content_schema[element.name] = neovalue
        })
        return purgedType
    }

    saveTypeToDisk(contentType: any, backup = false) {
        let yaml2write = yaml.safeDump(this.purgeType(contentType))
        let writePath = path.join(process.cwd(), ".draaft", `type-${contentType.id}.yml`)
        if (backup) {
            createFileSafe(writePath, yaml2write)
        } else {
            createFile(writePath, yaml2write)
        }
    }

    async run() {
        const { flags, args } = this.parse(Types)
        let typesList = []

        // Get item types list
        if (args.id) {
            try {
                this.spinner.start(`Get one item type (${args.id})`)
                typesList.push(await this.api.typesGetOne(args.id))
                this.spinner.succeed(`item type ${args.id} downloaded`)
                if (flags.save) {
                    this.saveTypeToDisk(typesList[0], flags.backup)
                }
            } catch (error) {
                this.spinner.fail("Error while downloading item type")
                signal.fatal(error)
                this.exit(1)
            }
        } else {
            try {
                this.spinner.start("Get item types list")
                let firstPage = await this.api.typesGetAll()
                typesList = firstPage.objects
                this.spinner.succeed("item types list downloaded")
                this.log(
                    "This list represents all item types created by the user \n ===================",
                )
            } catch (error) {
                this.spinner.fail("Error while downloading item types list")
                signal.fatal(error)
                this.exit(1)
            }
        }
        for (let type of typesList) {
            this.log(`📐  ${type.name} [id:${type.id}]`)
            if (flags.schema) {
                type.content_schema.forEach((field: any) => {
                    let required = field.required ? "required" : ""
                    this.log(
                        `    ${field.name} ${chalk.yellow(field.type)} ${chalk.gray(required)}`,
                    )
                })
            }
        }
    }
}
