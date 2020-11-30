import {flags} from '@oclif/command'
import {emptyDirSync, ensureDirSync} from 'fs-extra'
import * as _ from 'lodash'
import {BaseCommand} from '../base'
import {askChannels, askDestDir} from '../prompts'
import {signal} from '../signal'
import {Terraformer} from '../terraform'
import {Channel, ItemsApiResponse} from '../types'

const chalk = require('chalk')

export default class Pull extends BaseCommand {
    static description = 'Pull content and create files on disk'

    static flags = {
        help: flags.help({char: 'h'}),
        ssg: flags.string({description: 'Your static site generator.', options: ['hugo', 'gatsby'], default: 'hugo'}),
        channel: flags.integer({description: 'Channel to pull content from [int]'}),
        dest: flags.string({description: 'Destination folder where to write files'}),
        overwrite: flags.boolean({char: 'o', description: 'Empty destination folder before writing', default: false}),
    }

    async run() {
        const {flags} = this.parse(Pull)

        let destFolder: string
        if (flags.dest) {
            destFolder = flags.dest
        } else {
            let destFolderAnswer: any = await askDestDir()
            destFolder = destFolderAnswer.path
        }

        // Create top folder to place all content in. Create if not exists.
        this.spinner.start(`Checking destination folder${chalk.blue(destFolder)}`)
        try {
            ensureDirSync(destFolder)
            this.spinner.succeed(`Destination folder exists ${chalk.blue(destFolder)}`)
        } catch (error) {
            this.spinner.fail(`Destination folder not created ${chalk.red(destFolder)}`)
            signal.fatal(error)
            this.exit(1)
        }

        if (flags.overwrite) {
            try {
                emptyDirSync(destFolder)
                this.spinner.succeed(`All files deleted in destination folder ${chalk.blue(destFolder)}`)
            } catch (error) {
                this.spinner.fail(`Error while cleaning destination folder ${chalk.red(destFolder)}`)
                signal.fatal(error)
                this.exit(1)
            }
        }

        let channelsList: Channel[] = []
        let selectedChannel: Channel | undefined

        if (flags.channel) {
            // Get channel
            try{
                let qs = {
                    // Ask the server to serialize the prosemirror description to markdown
                    format_description: 'markdown'
                }
                this.spinner.start('Get channel')
                selectedChannel = await this.api.channelsGetOne(flags.channel, qs)
                this.spinner.succeed('Channel downloaded')
            } catch (error) {
                this.spinner.fail('Error while downloading channel')
                signal.fatal(error)
                this.exit(1)
            }
        }
        else {
            // Get channels list
            try {
                let qs = {
                    page_size: 100,
                    // Ask the server to serialize the prosemirror description to markdown
                    format_description: 'markdown'
                }
                this.spinner.start('Get channels list')
                let firstPage = await this.api.channelsGetAll(qs)
                channelsList = firstPage.objects
                this.spinner.succeed('Channels list downloaded')
            } catch (error) {
                this.spinner.fail('Error while downloading channels list')
                signal.fatal(error)
                this.exit(1)
            }

            let answer: any = await askChannels(channelsList)
            selectedChannel = _.find(channelsList, {id: answer.channel})
        }

        if( !selectedChannel ){
            return
        }

        let terraformer = new Terraformer(this.draaftConfig)

        signal.terraforming(chalk.blue('Creating the folder hierarchy'))
        terraformer.terraformChannel(selectedChannel, destFolder)

        signal.terraforming(chalk.blue('Creating the content files'))
        // Get items and write them to disk
        let page: number|null = 1
        let pageResult: ItemsApiResponse
        while( page ){
            try {
                this.spinner.start(`Downloading items for channel ${selectedChannel.name} (${selectedChannel.id})`)

                pageResult = await this.api.itemsGetAll({
                    page: page,
                    // Filter on the current channel
                    channels: selectedChannel.id,
                    // Expand the translation items
                    // expand: 'translations',
                    // increase page size to boost performances
                    page_size: 100,
                    // Ask the server to serialize the prosemirror content to markdown
                    format_content: 'markdown'
                })
                this.spinner.succeed('Items list downloaded')

                // Write to disk
                await terraformer.terraformItems(pageResult.objects)

                page = pageResult.next
            } catch (error) {
                this.spinner.fail('Error while downloading items list')
                signal.fatal(error)
                this.exit(1)
            }
        }
    }
}
