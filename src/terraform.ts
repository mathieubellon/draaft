import {CLIError} from '@oclif/errors'
import * as fs from 'fs-extra'
import * as matter from 'gray-matter'
import * as _ from 'lodash'
import * as path from 'path'
import * as yaml from 'js-yaml'
import {signal} from './signal'
import axios from 'axios'
import * as write from './write'
import slugify = require('@sindresorhus/slugify')
const chalk = require('chalk')

import {Channel, ChannelHierarchy, DraaftConfiguration, Item} from './types'


const currentPath = process.cwd()
const IMAGE_DIR = path.join(currentPath, 'static', 'img')
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g


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
            fs.ensureDirSync(dirPath)
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

    terraformChannel(channel: Channel, parentPath: string): void {
        let channelDirPath
        if( this.config.useChannelName ){
            let channelSlug = slugify(channel.name)
            channelDirPath = path.join(parentPath, channelSlug)
        }
        else{
            channelDirPath = parentPath
        }

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

    async terraformOneItem(item: Item) : Promise<void> {
        let itemFolder = itemFoldersMap[item.id]
        if( !itemFolder ){
            throw `Item ${item.id} has no correspondence in the hierarchy`
        }

        let dirPath = this.getItemDirPath(itemFolder, item)
        let fileName = this.getItemFileName(item)
        let content = await this.getFileContent(item)
        this.createContentFile(dirPath, fileName, content)
    }

    /**
     * Build a filepath for content according to Hugo io local config (i18n)
     *
     * @param document : Draaft document returned by Api
     * @param options : Extension configuration object
     */
    getItemDirPath(parentFolder: string, item: Item): string {
        let itemDirPath = parentFolder
        // first level folder may be 'en' or 'fr' if user decides so
        if (this.config.i18nActivated && this.config.i18nContentLayout === 'byfolder') {
            // fr_FR -> fr
            let languageCode = item.language ? item.language.split('_')[0] : this.config.i18nDefaultLanguage
            itemDirPath = path.join(itemDirPath, languageCode)
        }
        return itemDirPath
    }

    /**
     * Build a filepath for content according to Hugo io local config (i18n)
     *
     * @param item : Draaft document returned by Api
     * @param options : Extension configuration object
     */
    getItemFileName(item: Item): string {
        let itemFileName = item.title ? `${item.id}-${slugify(item.title)}` : `${item.id}-notitle`
        // Append correct extension
        if (this.config.i18nActivated && this.config.i18nContentLayout === 'byfilename' && item.language) {
            let languageCode = item.language.split('_')[0] // fr_FR -> fr
            itemFileName = itemFileName + '.' + languageCode + '.md'
        } else {
            // Content language can be set by folder structure or front matter property
            // so leave filemane agnostic
            itemFileName = itemFileName + '.md'
        }
        return itemFileName
    }

    /**
     * Prepare file contents before writing it
     *
     * @param item : Draaft item returned by Api
     */
    async getFileContent(item: any): Promise<string> {
        // Everything from document is in frontmatter (for now, may be updated downwards)
        let frontmatter = _.cloneDeep(item)
        let markdown = ''

        // If we have a content field, use it for markdown source
        if ( item.content.hasOwnProperty(this.config.contentFieldName) ){
            markdown = await this.fetchImages(item.content[this.config.contentFieldName])
        }

        // Do we have a local content schema ?

        let typeFilePath = `.draaft/type-${frontmatter.item_type}.yml`
        let typefile: any
        if (fs.existsSync(typeFilePath)) {
            typefile = yaml.safeLoad(fs.readFileSync(typeFilePath, 'utf8'))
        }

        if (typefile && typefile.content_schema) {
            signal.success('Custom type file found, using it')
            this.customiseFrontmatter(frontmatter, typefile.content_schema)
        } else {
            this.customiseFrontmatter(frontmatter)
        }

        return matter.stringify(markdown, frontmatter)
    }

    // Take a source content object as map it with local custom content schema
    customiseFrontmatter(frontmatter: any, schema?: any): any {
        delete frontmatter.channels
        delete frontmatter.targets
        let customTags: any[] = []
        frontmatter.tags.forEach((tag: any) => {
            customTags.push(tag.name)
        })
        frontmatter.tags = customTags

        if (schema) {
            // schema will only customise 'frontmatter.content' key, not frontmatter
            for (let key of Object.keys(frontmatter.content)) {
                // Do not show in frontmatter.content
                if (schema[key].fm_show === false) {
                    delete frontmatter.content[key]
                }
                // Rename key in frontmatter.content
                if (key !== schema[key].fm_key) {
                    let newKey = schema[key].fm_key
                    let oldKey = key
                    frontmatter.content[newKey] = frontmatter.content[oldKey]
                    delete frontmatter.content[oldKey]
                }
            }
        } else if (frontmatter.content[this.config.contentFieldName]) {
            delete frontmatter.content[this.config.contentFieldName]
        }

        // Translation key
        // This is a master trad
        if (frontmatter.translations.length) {
            frontmatter.translationKey = frontmatter.id
        }
        // This is a translation, linked to a master trad
        if (frontmatter.master_translation) {
            frontmatter.translationKey = frontmatter.master_translation
        }

        return frontmatter
    }

    async fetchImages(markdown: string): Promise<string>{
        this.createDir(IMAGE_DIR)
        let imagePromises = []

        for( let match of markdown.matchAll(MARKDOWN_IMAGE_REGEX) ){
            if( !match.groups || !match.groups.filename){
                continue
            }

            let imageUrl = match.groups.filename.trim()
            let imageName = imageUrl.split('/').slice(-1)[0]
            markdown = markdown.replace(imageUrl, '/img/' + imageName)

            let writeStream = fs.createWriteStream(path.join(IMAGE_DIR, imageName))
            let imagePromise = axios.get(imageUrl, {responseType: 'stream'})
            .then(response => {
                response.data.pipe(writeStream)
                signal.downloaded(`${chalk.gray(IMAGE_DIR)}${path.sep}${imageName}`)
            })
            imagePromises.push(imagePromise)
        }

        await Promise.all(imagePromises)

        return markdown
    }
}
