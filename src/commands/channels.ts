import * as _ from 'lodash'
import * as inquirer from 'inquirer'

import { Command, flags } from '@oclif/command'

import { Channel } from '../utils/types'
import draaftConfig from '../config'
import { getChannels } from '../utils/fetch'

export default class Channels extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Channels)

    const name = flags.name || 'world'
    this.log(`hello ${name} from /Users/matthieu/apps/draaft-cli/src/commands/channels.ts`)

    let arrayResp: Channel[] = []
    await getChannels(draaftConfig)
      .then(function (response: any) {
        //let topChannels = _.filter(response.data, function(channel) { return channel.level === 0; });

        response.data.forEach((channel: any) => {
          arrayResp.push(channel)
        })
        return arrayResp
      })
      .catch(function (error: any) {
        console.error(error)
      })
    // console.log(arrayResp)
    let promptChoices = _.map(arrayResp, (elt) => {
      return {
        name: elt.hierarchy,
        value: elt.id
      }
    })
    let responses: any = await inquirer.prompt([{
      name: 'channel',
      message: 'select a channel to pull content from',
      type: 'list',
      choices: promptChoices,
    }])
    console.log('you chose ' + responses.channel)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
