import { flags } from '@oclif/command'
import { BaseCommand } from '../base'
import { customSignal } from '../logging'
const chalk = require('chalk')

export default class Types extends BaseCommand {
  static description = 'List all content types'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    showcargo: flags.boolean({char: 's', description: 'Display content schema for each type'}),
  }

  async run() {
    const {flags} = this.parse(Types)
    // Get content types list
    let typesList = []
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
    typesList.forEach((type: any) => {
      this.log(`📐  ${type.name} [id:${type.id}]`)
      if (flags.showcargo) {
        type.content_schema.forEach((field: any) => {
          let required = field.required ? 'required' : ''
          this.log(`    ${field.name} ${chalk.yellow(field.type)} ${chalk.gray(required)}`)
        })
      }
    })
  }
}
