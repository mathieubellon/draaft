import * as _ from 'lodash'
import * as inquirer from 'inquirer'

import * as path from 'path'
import * as write from '../write'

import * as ora from 'ora'
import Command from '../base'
import { flags } from '@oclif/command'
import { getChannels, getItems } from '../fetch'
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
    let allChannels: Channel[] = []
    // Get channels list
    let urlstring = url.format({
      protocol: config.apiScheme,
      host: config.apiHost,
      pathname: config.apiEndpointChannels,
    })
    const myURL = new URL(urlstring)
    
    await this.$axios.get(myURL.href).then(function (response: any) {
        response.data.forEach((channel: any) => {
          allChannels.push(channel)
        })
        // TODO cache response on file for further use downstream
        return allChannels
      })
      .catch(function (error: any) {
        console.error(error)
      })
    // Ask user which channel to pull content from
    // First Create a proper array of questions for CLI prompt
    let promptChoices = _.map(allChannels, elt => {
      return {
        name: elt.hierarchy,
        value: elt.id
      }
    })
    let responses: any = await inquirer.prompt([{
      name: 'channel',
      message: 'Select a channel to pull content from\n',
      type: 'list',
      choices: promptChoices,
    }])

    // Get selected channel and children
    const selectedChannel: Channel|undefined = _.find(allChannels, { id: responses.channel })
    if (!selectedChannel) { return }

    // TODO Better path selection (with autocomplete) + let user input its top content folder name
    let destFolder = path.join(process.cwd(), 'content')
    console.log('Top destination folder : ' + destFolder)
    // Create top folder ro place all content in. Create if not exists.
    write.createFolder(destFolder).then(() => {
      const spinner = ora({ color: 'yellow', text: `Downloading content for channel ${selectedChannel.name}` }).start()
      let qs = { channels: selectedChannel.id }
      getItems(Config, qs)
        .then(function (response: any) {
          spinner.succeed(`${response.data.count} Content items successfully downloaded`)
          let allItems: any[] = response.data.results
          terraForm(selectedChannel, allItems, destFolder)
        })
        .catch(function (error: any) {
          spinner.fail('Error while downloading content')
          console.error(error)
        })
    })
      .catch(error => {
        console.error('Could not create top content folder', error)
      })
  }
}
