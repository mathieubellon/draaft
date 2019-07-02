import { flags } from '@oclif/command'
import { customSignal } from '../logging'
import { BaseCommand } from '../base'
import * as yaml from 'js-yaml'
import * as path from 'path'
import * as fs from 'fs-extra'


export default class States extends BaseCommand {
  static description = 'List all workflow states'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    // name: flags.string({ char: 'n', description: 'name to print' }),
    // // flag with no value (-f, --force)
    save: flags.boolean({char: 's', description: 'Save states as file for customisation'}),
  }

  async run() {
    const { flags } = this.parse(States)

    // Get workflow states list
    let statesList = []
    try {
      this.spinner.start('Get workflow states list')
      statesList = await this.api.workflowGetAll()
      this.spinner.succeed('Workflow states list downloaded')
      this.log(
        'This list represents all workflow states created by the user'
      )
      this.log(
        '==================='
      )
    } catch (error) {
      this.spinner.fail('Error while downloading workflow states list')
      customSignal.fatal(error)
      this.exit(1)
    }
    statesList.forEach((state: any) => {
      this.log(`🏳   ${state.label} [id:${state.id}]`)
    })
    if (flags.save) {
      const CURR_DIR = process.cwd()
      let writePath = path.join(CURR_DIR, '.draaft', 'states.yml')
      statesList.forEach((element: any) => {
        element.is_draft = true
      })
      try {
        fs.writeFileSync(writePath, yaml.safeDump(statesList))
      } catch (error) {
        customSignal.fatal(error)
      }
    }
  }
}
