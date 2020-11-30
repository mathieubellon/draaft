import {CLIError} from '@oclif/errors'
import {ensureDirSync} from 'fs-extra'
import * as matter from 'gray-matter'
import * as _ from 'lodash'
import * as path from 'path'
import {Preparator} from './prepare'
import {signal} from './signal'
import {Channel, ChannelHierarchy, DraaftConfiguration, Item} from './types'
import * as write from './write'
import slugify = require('@sindresorhus/slugify')
const chalk = require('chalk')

let itemFoldersMap: Record<number, string> = {}


export class Terraformer{
    config: DraaftConfiguration

    /**
     * Terraform pilot content to SSG content
     * @param config - Draaft configuration
     */
    constructor(config: DraaftConfiguration) {
        this.config = config
    }

    createDir(dirPath: string) : void{
        try {
            ensureDirSync(dirPath)
            signal.created(`📁 ${dirPath}`)
        } catch (error) {
            signal.fatal(`📁 ${dirPath} not created`)
            throw new CLIError(error)
        }
    }

    createContentFile(dirPath: string, fileName: string, content: string) : void{
        try {
            write.createFile(path.join(dirPath, fileName), content)
            signal.created(`📄 ${chalk.gray(dirPath)}${path.sep}${fileName}`)
        } catch (error) {
            signal.fatal(error)
            throw new CLIError(error)
        }
    }


    writeChannelHierarchy(hierarchy: ChannelHierarchy, parentDirPath: string) : void{
        for( let node of hierarchy ){
            if( node.type == 'folder' ){
                let folderPath = path.join(parentDirPath, node.name)
                this.createDir(folderPath)
                let indexContent = matter.stringify(node.name, {title: node.name})
                this.createContentFile(folderPath, '_index.md', indexContent)

                this.writeChannelHierarchy(node.nodes, folderPath)
            }

            if( node.type == 'item' ){
                itemFoldersMap[node.id] = parentDirPath
            }
        }
    }


    terraformChannel(channel: Channel, parentPath: string): void {
        let channelSlug = slugify(channel.name)
        let channelDirPath = path.join(parentPath, channelSlug)

        // Create section folder
        this.createDir(channelDirPath)

        // Create _index.md file for channel root dir
        let frontmatter: any = _.cloneDeep(channel)
        if (this.config.ssg === 'hugo') {
            frontmatter.title = channel.name
            delete frontmatter.name
            delete frontmatter.hierarchy
            delete frontmatter.children
        }
        let indexContent = matter.stringify(String(frontmatter.description), frontmatter)
        this.createContentFile(channelDirPath, '_index.md', indexContent)

        this.writeChannelHierarchy(channel.hierarchy, channelDirPath)
    }


    async terraformOneItem(item: Item) : Promise<void> {
        let itemFolder = itemFoldersMap[item.id]
        if( !itemFolder ){
            throw `Item ${item.id} has no correspondence in the hierarchy`
        }

        let preparator = new Preparator(this.config)
        let dirPath = preparator.getItemDirPath(itemFolder, item)
        let fileName = preparator.getItemFileName(item)
        let content = await preparator.getFileContent(item)
        this.createContentFile(dirPath, fileName, content)
    }

    /**
     * With a channel list and all items depending attached to it (on its children) build a directory of .md files
     * with a proper folder structure and filename pattern according to user config
     *
     * @param items : List of items attached to this channel
     */
    async terraformItems(items: Array<Item>) : Promise<void> {
        // Currently we write synchronously to have a nice indented terminal output for user, trading speed for UX.
        // TODO : Build a report object from async calls to have best of both world.
        for (let item of items) {
            await this.terraformOneItem(item)
            /*
            for( let translation of item.translations ){
              terraformOneItem(channel, translation, currentFolder, config)
            }
            */
        }
    }
}
