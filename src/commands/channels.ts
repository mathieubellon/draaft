import * as _ from 'lodash'
import * as inquirer from 'inquirer'
import * as ora from 'ora'
import * as querystring from 'querystring'
import * as write from '../write'

import { Command, flags } from '@oclif/command'
import { getChannels, getItems } from '../fetch'

import { Channel } from '../types'
import draaftConfig from '../config'

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
    let allChannels: Channel[] = []
    // Get channels list
    await getChannels(draaftConfig)
      .then(function (response: any) {
        response.data.forEach((channel: any) => {
          allChannels.push(channel)
        })
        // TODO cache response on file for further use downstream
        return allChannels
      })
      .catch(function (error: any) {
        console.error(error)
      })
    // Create a proper array of questions for CLI prompt
    let promptChoices = _.map(allChannels, elt => {
      return {
        name: elt.hierarchy,
        value: elt.id
      }
    })
    // Ask user which channel to pull content from
    let responses: any = await inquirer.prompt([{
      name: 'channel',
      message: 'Select a channel to pull content from\n',
      type: 'list',
      choices: promptChoices,
    }])

    let qs = { channels: responses.channel }

    // start the spinner
    const spinner = ora(`Downloading content for channel ${responses.channel}`)
    spinner.color = 'yellow'
    spinner.start()
    let allItems: any[] = []
    await getItems(draaftConfig, qs)
      .then(function (response: any) {
        spinner.succeed(`${response.data.count} Content items successfully downloaded`)
        response.data.results.forEach((item: any) => {
          //console.log(response.data.results)
          allItems = response.data.results
        })
      })
      .catch(function (error: any) {
        spinner.fail('Error while downloading content')
        console.error(error)
      })

    // Build Content Folder

    let selectedChannel = _.find(allChannels, { id: responses.channel })
    //console.log(selectedChannel)

    // Build top channel
    if (selectedChannel) {
      console.log("Create folder " + selectedChannel.name)
    }

    // Filter direct items attached to this top channel
    let directItems = _.filter(allItems, item => {
      return item.channels.includes(responses.channel)
    })
    directItems.forEach(element => {
      console.log(element.title)
    });
  }
}
