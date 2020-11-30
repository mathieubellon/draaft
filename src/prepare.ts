import * as slugify from '@sindresorhus/slugify'
import * as fs from 'fs-extra'
import * as matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as _ from 'lodash'
import * as path from 'path'
import axios from 'axios'
import {signal} from './signal'
import {DraaftConfiguration, Item} from './types'
const chalk = require('chalk')

const IMAGE_DIR = path.join('static', 'img')
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g

export class Preparator {
    config: DraaftConfiguration

    /**
     * @param config - Draaft configuration
     */
    constructor(config: DraaftConfiguration) {
        this.config = config
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
        fs.ensureDir(IMAGE_DIR)
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
