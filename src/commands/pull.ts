import * as _ from 'lodash'
import * as inquirer from 'inquirer'

import * as path from 'path'
import * as write from '../write'
import { askChannels } from '../prompts'


import Command from '../base'
import { flags } from '@oclif/command'
import { getUrl } from '../fetch'
import * as querystring from 'querystring'
import * as url from 'url'

import { Channel } from '../types'
import config from '../config'

import { terraForm } from '../terraform'

export default class Pull extends Command {
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
    const spinner = this.spinner
    let channelsList: Channel[] = []
    let itemsList: any[] = []
    // Get channels list

    const channelsURL = getUrl('channels', config)
    await this.$axios.get(channelsURL)
      .then(function (response: any) {
        channelsList = response.data
      })
      .catch(function (error: any) {
        console.error(error)
      })

    let pickedChannel:any = await askChannels(channelsList)

    // Get selected channel and children
    const selectedChannel: Channel | undefined = _.find(channelsList, { id: pickedChannel.channel })
    if (!selectedChannel) { return }

    // TODO Better path selection (with autocomplete) + let user input its top content folder name
    let destFolder = path.join(process.cwd(), 'content')
    // Create top folder ro place all content in. Create if not exists.
    await write.createFolder(destFolder)
      .then(() => {
        console.log(`Dest folder ${destFolder} created`)
      })
      .catch(error => {
        console.error(`Error while attempting to create dest folder ${destFolder}`, error)
      })
    spinner.start(`Downloading content for channel ${selectedChannel.name}`)
    let qs = { channels: selectedChannel.id }
    const itemsURL = getUrl('items', config, qs)
    await this.$axios.get(itemsURL)
      .then(function (response: any) {
        spinner.succeed(`${response.data.count} Content items successfully downloaded`)
        itemsList = response.data.results
      })
      .catch(function (error: any) {
        spinner.fail('Error while downloading content')
        console.error(error)
      })
    terraForm(selectedChannel, itemsList, destFolder)
  }
}
