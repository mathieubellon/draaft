import {Command, flags} from '@oclif/command'

import draaftConfig from '../config'
import {getChannels} from '../utils/fetch'

export default class Channels extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Channels)

    const name = flags.name || 'world'
    this.log(`hello ${name} from /Users/matthieu/apps/draaft-cli/src/commands/channels.ts`)
    getChannels(draaftConfig)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
