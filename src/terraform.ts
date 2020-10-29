import {CLIError} from '@oclif/errors'
import {ensureDirSync} from 'fs-extra'
import * as matter from 'gray-matter'
import * as _ from 'lodash'
import * as path from 'path'
import * as prepare from './prepare'
import {signal} from './signal'
import {Channel, ChannelHierarchy, DraaftConfiguration, Item} from './types'
import * as write from './write'
import slugify = require('@sindresorhus/slugify')

const chalk = require('chalk')

let itemFoldersMap: Record<number, string> = {}


function createDir(dirPath: string){
    try {
        ensureDirSync(dirPath)
        signal.created(`📁 ${dirPath}`)
    } catch (error) {
        signal.fatal(`📁 ${dirPath} not created`)
        throw new CLIError(error)
    }
}

function createContentFile(dirPath: string, fileName: string, content: string){
    try {
        write.createFile(path.join(dirPath, fileName), content)
        signal.created(`📄 ${chalk.gray(dirPath)}${path.sep}${fileName}`)
    } catch (error) {
        signal.fatal(error)
        throw new CLIError(error)
    }
}


function writeChannelHierarchy(hierarchy: ChannelHierarchy, parentDirPath: string){
    for( let node of hierarchy ){
        if( node.type == 'folder' ){
            let folderPath = path.join(parentDirPath, node.name)
            createDir(folderPath)
            let indexContent = matter.stringify(node.name, {title: node.name})
            createContentFile(folderPath, '_index.md', indexContent)

            writeChannelHierarchy(node.nodes, folderPath)
        }

        if( node.type == 'item' ){
            itemFoldersMap[node.id] = parentDirPath
        }
    }
}


export function terraformChannel(channel: Channel, parentPath: string, config: DraaftConfiguration): void {
    let channelSlug = slugify(channel.name)
    let channelDirPath = path.join(parentPath, channelSlug)

    // Create section folder
    createDir(channelDirPath)

    // Create _index.md file for channel root dir
    let frontmatter: any = _.cloneDeep(channel)
    if (config.ssg === 'hugo') {
        frontmatter.title = channel.name
        delete frontmatter.name
        delete frontmatter.hierarchy
        delete frontmatter.children
    }
    let indexContent = matter.stringify(String(frontmatter.description), frontmatter)
    createContentFile(channelDirPath, '_index.md', indexContent)

    writeChannelHierarchy(channel.hierarchy, channelDirPath)
}


function terraformOneItem(item: Item, config: DraaftConfiguration) {
    let itemFolder = itemFoldersMap[item.id]
    if( !itemFolder ){
        throw `Item ${item.id} has no correspondence in the hierarchy`
    }

    let dirPath = prepare.getItemDirPath(itemFolder, item, config)
    let fileName = prepare.getItemFileName(item, config)
    let content = prepare.fileContent(item)
    createContentFile(dirPath, fileName, content)
}

/**
 * With a channel list and all items depending attached to it (on its children) build a directory of .md files
 * with a proper folder structure and filename pattern according to user config
 *
 * @param items : List of items attached to this channel
 */
export function terraformItems(items: Array<Item>, config: DraaftConfiguration): void {
    // Currently we write synchronously to have a nice indented terminal output for user, trading speed for UX.
    // TODO : Build a report object from async calls to have best of both world.
    for (let item of items) {
        terraformOneItem(item, config)
        /*
        for( let translation of item.translations ){
          terraformOneItem(channel, translation, currentFolder, config)
        }
        */
    }
}
