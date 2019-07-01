import { flags } from '@oclif/command'
import { customSignal } from '../logging'
import { BaseCommand } from '../base'

export default class States extends BaseCommand {
  static description = 'List all workflow states'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    // name: flags.string({ char: 'n', description: 'name to print' }),
    // // flag with no value (-f, --force)
    // force: flags.boolean({ char: 'f' })
  }

  async run() {
    // const { flags } = this.parse(States)

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
  }
}
