import { flags } from '@oclif/command'
import { BaseCommand } from '../base'
import { customSignal } from '../logging'
const chalk = require('chalk')
import * as fs from 'fs-extra'
import * as path from 'path'
import * as yaml from 'js-yaml'

export default class Types extends BaseCommand {
  static description = 'List all content types'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    withcargo: flags.boolean({char: 'w', description: 'Display content schema for each type'}),
    save: flags.boolean({char: 's', description: 'Save content shema as file for customisation'}),
  }

  static args = [
    {name: 'id', description: 'ID of type', required: false}
  ]

  purgeType(srcType: any) {
    let purgedType: any = {}
    purgedType.id = srcType.id
    purgedType.name = srcType.name
    purgedType.content_schema = []

    srcType.content_schema.forEach((element: any) => {
      let neovalue: any = {}
      neovalue.name = element.name
      neovalue.fm_show = true
      neovalue.fm_key = element.name
      if (element.name === 'body') {
        neovalue.fm_show = false
      }
      purgedType.content_schema.push(neovalue)
    })
    return purgedType
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
          const CURR_DIR = process.cwd()
          let json2write: any = {}
          json2write = this.purgeType(typesList[0])
          let writePath = path.join(CURR_DIR, '.draaft', `type-${json2write.id}.yml`)
          console.log(writePath)
          try {
            fs.writeFileSync(writePath, yaml.safeDump(json2write))
          } catch (error) {
            customSignal.fatal(error)
          }
        }
      } catch (error) {
        this.spinner.fail('Error while downloading content type')
        customSignal.fatal(error)
        this.exit(1)
      }
    } else {
      try {
        this.spinner.start('Get content types list')
        typesList = await this.api.typesGetAll()
        this.spinner.succeed('content types list downloaded')
        this.log(
          'This list represents all content types created by the user'
        )
        this.log(
          '==================='
        )
      } catch (error) {
        this.spinner.fail('Error while downloading content types list')
        customSignal.fatal(error)
        this.exit(1)
      }
    }
    typesList.forEach((type: any) => {
      this.log(`📐  ${type.name} [id:${type.id}]`)
      if (flags.withcargo) {
        type.content_schema.forEach((field: any) => {
          let required = field.required ? 'required' : ''
          this.log(`    ${field.name} ${chalk.yellow(field.type)} ${chalk.gray(required)}`)
        })
      }
    })
  }
}
