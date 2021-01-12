import { flags } from "@oclif/command"
import { OutputFlags } from "@oclif/parser"
import * as fs from "fs-extra"
import * as path from "path"
import chalk from "chalk"

import { BaseCommand } from "../base"
import { askChannels, askDestDir, askPublicationStates } from "../prompts"
import { signal } from "../signal"
import { Terraformer } from "../terraform"
import { Channel, ContentSource, ItemsApiResponse } from "../types"

const CONTENT_SOURCE_FILE_NAME = ".draaft.source.json"

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

    parsedFlags!: OutputFlags<typeof Pull.flags>
    destFolder!: string
    channelsList!: Channel[]
    selectedChannelIds!: number[]
    selectedChannels!: Channel[]
    publicationStateIds!: number[]

    async run() {
        const { flags } = this.parse(Pull)
        this.parsedFlags = flags

        await this.seekDestFolder()

        let contentSourceFilePath = path.join(this.destFolder, CONTENT_SOURCE_FILE_NAME)
        if (fs.existsSync(contentSourceFilePath)) {
            this.loadSourceFile(contentSourceFilePath)
            await this.fetchChannelsList()
        } else {
            await this.fetchChannelsList()
            await this.seekChannelIds()
            await this.seekPublicationState()
            this.writeSourceFile(contentSourceFilePath)
        }

        this.findChannels()
        await this.terraform()
    }

    /********************
     * Destination Folder
     ********************/

    async seekDestFolder() {
        if (this.parsedFlags.dest) {
            this.destFolder = this.parsedFlags.dest
        } else {
            let destFolderAnswer: any = await askDestDir()
            this.destFolder = destFolderAnswer.path
        }

        if (!this.destFolder) {
            signal.error("No destination folder selected")
            this.exit(1)
        }

        // Create top directory to place all content in. Create if not exists.
        this.spinner.start(`Checking destination directory ${chalk.blue(this.destFolder)}`)
        try {
            fs.ensureDirSync(this.destFolder)
            this.spinner.succeed(`Destination directory exists ${chalk.blue(this.destFolder)}`)
        } catch (error) {
            this.spinner.fail(`Destination directory not created ${chalk.red(this.destFolder)}`)
            signal.fatal(error)
            this.exit(1)
        }

        if (this.parsedFlags.overwrite) {
            try {
                fs.emptyDirSync(this.destFolder)
                this.spinner.succeed(
                    `All files deleted in destination directory ${chalk.blue(this.destFolder)}`,
                )
            } catch (error) {
                this.spinner.fail(
                    `Error while cleaning destination directory ${chalk.red(this.destFolder)}`,
                )
                signal.fatal(error)
                this.exit(1)
            }
        }
    }

    /********************
     * Source file
     ********************/

    writeSourceFile(contentSourceFilePath: string) {
        let contentSource: ContentSource = {
            channelIds: this.selectedChannelIds,
            publicationStateIds: this.publicationStateIds,
        }
        fs.writeFileSync(contentSourceFilePath, JSON.stringify(contentSource, null, 4))
    }

    loadSourceFile(contentSourceFilePath: string) {
        signal.info(chalk.magenta(`Using source configuration from ${contentSourceFilePath}`))
        try {
            let contentSourceFile = fs.readFileSync(contentSourceFilePath, "utf8")
            let contentSource: ContentSource = JSON.parse(contentSourceFile)
            this.selectedChannelIds = contentSource.channelIds
            this.publicationStateIds = contentSource.publicationStateIds
        } catch (error) {
            signal.fatal(
                "Error while reading source configuration file. You should probably delete it and call the command again.",
            )
            signal.fatal(error)
            this.exit(1)
        }
    }

    /********************
     * Channels
     ********************/

    async fetchChannelsList() {
        // Get channels list
        try {
            this.spinner.start("Get channels list")
            let firstPage = await this.api.channelsGetAll({
                page_size: 100,
                // Ask the server to serialize the prosemirror description to markdown
                format_description: "markdown",
            })
            this.channelsList = firstPage.objects
            this.spinner.succeed("Channels list downloaded")
        } catch (error) {
            this.spinner.fail("Error while downloading channels list")
            signal.fatal(error)
            this.exit(1)
        }
    }

    async seekChannelIds() {
        // Figure out which channel ids the user want to terraform
        if (this.parsedFlags.channel) {
            this.selectedChannelIds = this.parsedFlags.channel
        } else {
            let answer = await askChannels(this.channelsList)
            this.selectedChannelIds = answer.channel
        }
    }

    findChannels() {
        // Find the corresponding channels, and remove ids without correspondence
        this.selectedChannels = this.selectedChannelIds
            .map((channelId) => this.channelsList.find((channel) => channel.id == channelId))
            .filter((channel): channel is Channel => channel != undefined)

        if (this.selectedChannels.length == 0) {
            signal.error("No channel selected")
            this.exit(1)
        }
    }

    /********************
     * Publication state
     ********************/

    async seekPublicationState() {
        if (this.parsedFlags.publicationState) {
            this.publicationStateIds = this.parsedFlags.publicationState
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
            this.publicationStateIds = answer.workflowState
        }
    }

    /********************
     * Terraforming
     ********************/

    async terraform() {
        let terraformer = new Terraformer(
            this.draaftConfig,
            this.destFolder,
            this.publicationStateIds,
        )

        for (let selectedChannel of this.selectedChannels) {
            signal.terraforming(
                chalk.magenta(
                    `Terrraforming channel ${selectedChannel.name} (${selectedChannel.id})`,
                ),
            )

            signal.terraforming(chalk.blue("Creating the directory hierarchy"))
            terraformer.terraformChannel(selectedChannel)

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
