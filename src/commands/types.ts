import { flags } from '@oclif/command'
import { BaseCommand } from '../base'
import { signal } from '../signal'
const chalk = require('chalk')
import * as fs from 'fs-extra'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { createFileSafe, createFile } from '../write';

export default class Types extends BaseCommand {
  static description = 'List all content types'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    schema: flags.boolean({char: 'w', description: 'Display content schema for each type'}),
    save: flags.boolean({char: 's', description: 'Save content shema as file for customisation'}),
    backup: flags.boolean({char: 'b', description: 'If file exists create backup'}),
  }

  static args = [
    {name: 'id', description: 'ID of type', required: false}
  ]

  purgeType(srcType: any) {
    let purgedType: any = {}
    purgedType.id = srcType.id
    purgedType.name = srcType.name
    purgedType.content_schema = {}

    srcType.content_schema.forEach((element: any) => {
      let neovalue: any = {}

      neovalue.fm_show = true
      neovalue.fm_key = element.name
      if (element.name === 'body') {
        neovalue.fm_show = false
      }
      purgedType.content_schema[element.name] = neovalue
    })
    return purgedType
  }

  saveTypeToDisk(contentType: any, backup = false){
    let yaml2write = yaml.safeDump(this.purgeType(contentType))
    let writePath = path.join(process.cwd(), '.draaft', `type-${contentType.id}.yml`)
    if (backup) {
      createFileSafe(writePath, yaml2write)
    } else {
      createFile(writePath, yaml2write)
    }
  }

  async run() {
    const {flags, args} = this.parse(Types)
    let typesList = []

    // Get content types list
    if (args.id) {
      try {
        this.spinner.start(`Get one content type (${args.id})`)
        typesList.push(await this.api.typesGetOne(args.id))
        this.spinner.succeed(`content type ${args.id} downloaded`)
        if (flags.save) {
          this.saveTypeToDisk(typesList[0], flags.backup)
        }
      } catch (error) {
        this.spinner.fail('Error while downloading content type')
        signal.fatal(error)
        this.exit(1)
      }
    } else {
      try {
        this.spinner.start('Get content types list')
        let firstPage = await this.api.typesGetAll()
        typesList = firstPage.results
        this.spinner.succeed('content types list downloaded')
        this.log('This list represents all content types created by the user \n ===================')
      } catch (error) {
        this.spinner.fail('Error while downloading content types list')
        signal.fatal(error)
        this.exit(1)
      }
    }
    typesList.forEach((type: any) => {
      this.log(`📐  ${type.name} [id:${type.id}]`)
      if (flags.schema) {
        type.content_schema.forEach((field: any) => {
          let required = field.required ? 'required' : ''
          this.log(`    ${field.name} ${chalk.yellow(field.type)} ${chalk.gray(required)}`)
        })
      }
    })
  }
}
