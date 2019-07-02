import * as _ from 'lodash'

import {askChannels, askDestDir} from '../prompts'

import {Channel} from '../types'
import {BaseCommand} from '../base'
import {customSignal} from '../logging'
import {flags} from '@oclif/command'
import {terraForm} from '../terraform'
import {ensureDirSync, emptyDirSync} from 'fs-extra'

const chalk = require('chalk')

export default class Pull extends BaseCommand {
  static description = 'Pull content and create files on disk'

  static flags = {
    help: flags.help({char: 'h'}),
    ssg: flags.string({description: 'Your static site generator.', options: ['hugo', 'gatsby'], default: 'hugo'}),
    channel: flags.string({description: 'Channel to pull content from [int]'}),
    dest: flags.string({description: 'Destination folder where to write files'}),
    overwrite: flags.boolean({char: 'o', description: 'Empty destination folder before writing', default: false}),
    notopfolder: flags.boolean({char: 'n', description: 'Do not create a folder for the top directory', default: false}),
  }

  async run() {
    const {flags} = this.parse(Pull)
    // if (flags.force) console.log('--force is set')
    // if (flags.file) console.log(`--file is: ${flags.file}`)
    let channelsList: Channel[] = []
    let itemsList: any[] = []

    let destFolder: string
    if (flags.dest) {
      destFolder = flags.dest
    } else {
      let destFolderAnswer: any = await askDestDir()
      destFolder = destFolderAnswer.path
    }

    // Create top folder ro place all content in. Create if not exists.
    this.spinner.start(`Checking destination folder${chalk.blue(destFolder)}`)
    try {
      ensureDirSync(destFolder)
      this.spinner.succeed(`Destination folder exists ${chalk.blue(destFolder)}`)
    } catch (error) {
      this.spinner.fail(`Destination folder not created ${chalk.red(destFolder)}`)
      customSignal.fatal(error)
      this.exit(1)
    }

    if (flags.overwrite) {
      try {
        emptyDirSync(destFolder)
        this.spinner.succeed(`All files deleted in destination folder ${chalk.blue(destFolder)}`)
      } catch (error) {
        this.spinner.fail(`Error while cleaning destination folder ${chalk.red(destFolder)}`)
        customSignal.fatal(error)
        this.exit(1)
      }
    }
    // Get channels list
    try {
      this.spinner.start('Get channels list')
      channelsList = await this.api.channelsGetAll()
      this.spinner.succeed('Channels list downloaded')
    } catch (error) {
      this.spinner.fail('Error while downloading channels list')
      customSignal.fatal(error)
      this.exit(1)
    }
    let pickedChannel: number
    if (flags.channel) {
      pickedChannel = parseInt(flags.channel, 10)
    } else {
      let answer: any = await askChannels(channelsList)
      pickedChannel = answer.channel
    }
    // Get selected channel and children
    const selectedChannel: Channel | undefined = _.find(channelsList, {id: pickedChannel})
    if (!selectedChannel) { return }

    // Get items list
    try {
      let qs = {channels: selectedChannel.id}
      this.spinner.start(`Downloading content for channel ${selectedChannel.name} (${selectedChannel.id})`)
      itemsList = await this.api.itemsGetAll(qs)
      this.spinner.succeed('Items list downloaded')
    } catch (error) {
      this.spinner.fail('Error while downloading items list')
      customSignal.fatal(error)
      this.exit(1)
    }
    // Write to disk
    customSignal.terraforming(chalk.blue('Creating your files in destination folder'))
    terraForm(selectedChannel, itemsList, destFolder, this.configuration)
  }
}
