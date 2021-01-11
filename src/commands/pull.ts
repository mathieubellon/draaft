import { flags } from "@oclif/command"
import { emptyDirSync, ensureDirSync } from "fs-extra"
import chalk from "chalk"
import { BaseCommand } from "../base"
import { askChannels, askDestDir, askPublicationStates } from "../prompts"
import { signal } from "../signal"
import { Terraformer } from "../terraform"
import { Channel, ItemsApiResponse } from "../types"

export default class Pull extends BaseCommand {
    static description = "Pull content and create files on disk"

    static flags = {
        help: flags.help({ char: "h" }),
        ssg: flags.string({
            description: "Your static site generator.",
            options: ["hugo", "gatsby"],
            default: "hugo",
        }),
        dest: flags.string({ description: "Destination directory where to write files" }),
        channel: flags.integer({
            description: "[int] [multiple] Channel to pull content from",
            multiple: true,
        }),
        publicationState: flags.integer({
            description: "[int] [multiple] workflow state for a published content",
            multiple: true,
        }),
        overwrite: flags.boolean({
            char: "o",
            description: "Empty destination directory before writing",
            default: false,
        }),
    }

    async run() {
        const { flags } = this.parse(Pull)

        /********************
         * Destination Folder
         ********************/

        let destFolder: string
        if (flags.dest) {
            destFolder = flags.dest
        } else {
            let destFolderAnswer: any = await askDestDir()
            destFolder = destFolderAnswer.path
        }

        // Create top directory to place all content in. Create if not exists.
        this.spinner.start(`Checking destination directory ${chalk.blue(destFolder)}`)
        try {
            ensureDirSync(destFolder)
            this.spinner.succeed(`Destination directory exists ${chalk.blue(destFolder)}`)
        } catch (error) {
            this.spinner.fail(`Destination directory not created ${chalk.red(destFolder)}`)
            signal.fatal(error)
            this.exit(1)
        }

        if (flags.overwrite) {
            try {
                emptyDirSync(destFolder)
                this.spinner.succeed(
                    `All files deleted in destination directory ${chalk.blue(destFolder)}`,
                )
            } catch (error) {
                this.spinner.fail(
                    `Error while cleaning destination directory ${chalk.red(destFolder)}`,
                )
                signal.fatal(error)
                this.exit(1)
            }
        }

        /********************
         * Channels
         ********************/

        let channelsList: Channel[] = []
        let selectedChannelIds: number[]
        let selectedChannels: Channel[]

        // Get channels list
        try {
            this.spinner.start("Get channels list")
            let firstPage = await this.api.channelsGetAll({
                page_size: 100,
                // Ask the server to serialize the prosemirror description to markdown
                format_description: "markdown",
            })
            channelsList = firstPage.objects
            this.spinner.succeed("Channels list downloaded")
        } catch (error) {
            this.spinner.fail("Error while downloading channels list")
            signal.fatal(error)
            this.exit(1)
        }

        // Figure out which channel ids the user want to terraform
        if (flags.channel) {
            selectedChannelIds = flags.channel
        } else {
            let answer = await askChannels(channelsList)
            selectedChannelIds = answer.channel
        }

        // Find the corresponding channels, and remove ids without correspondence
        selectedChannels = selectedChannelIds
            .map((channelId) => channelsList.find((channel) => channel.id == channelId))
            .filter((channel): channel is Channel => channel != undefined)

        if (selectedChannels.length == 0) {
            return
        }

        /********************
         * Publication state
         ********************/

        let publicationStateIds

        if (flags.publicationState) {
            publicationStateIds = flags.publicationState
        } else {
            let statesList = []
            try {
                this.spinner.start("Get workflow states list")
                let firstPage = await this.api.workflowGetAll()
                statesList = firstPage.objects
                this.spinner.succeed("Workflow states list downloaded")
            } catch (error) {
                this.spinner.fail("Error while downloading workflow states list")
                signal.fatal(error)
                this.exit(1)
            }

            let answer: any = await askPublicationStates(statesList)
            publicationStateIds = answer.workflowState
        }

        /********************
         * Terraforming
         ********************/

        let terraformer = new Terraformer(this.draaftConfig, publicationStateIds)

        for (let selectedChannel of selectedChannels) {
            signal.terraforming(
                chalk.magenta(
                    `Terrraforming channel ${selectedChannel.name} (${selectedChannel.id})`,
                ),
            )

            signal.terraforming(chalk.blue("Creating the directory hierarchy"))
            terraformer.terraformChannel(selectedChannel, destFolder)

            signal.terraforming(chalk.blue("Creating the content files"))
            // Get items and write them to disk
            let page: number | null = 1
            let pageResult: ItemsApiResponse
            while (page) {
                try {
                    this.spinner.start(`Downloading items`)

                    pageResult = await this.api.itemsGetAll({
                        page: page,
                        // Filter on the current channel
                        channels: selectedChannel.id,
                        // Expand the translation items
                        // expand: 'translations',
                        // increase page size to boost performances
                        page_size: 100,
                        // Ask the server to serialize the prosemirror content to markdown
                        format_content: "markdown",
                    })
                    this.spinner.succeed("Items list downloaded")

                    // Write to disk
                    await terraformer.terraformItems(pageResult.objects)

                    page = pageResult.next
                } catch (error) {
                    this.spinner.fail("Error while downloading items list")
                    signal.fatal(error)
                    this.exit(1)
                }
            }
        }
    }
}
