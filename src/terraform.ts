import axios from "axios"
import * as fs from "fs-extra"
import * as matter from "gray-matter"
import * as yaml from "js-yaml"
import * as _ from "lodash"
import * as path from "path"
import * as toml from "@iarna/toml"
import slugify from "@sindresorhus/slugify"
import { signal } from "./signal"
import {
    Channel,
    ChannelHierarchy,
    DraaftConfiguration,
    I18nMode,
    Item,
    SSGType,
    FrontmatterFormat,
} from "./types"
import * as write from "./write"

const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g

let itemFoldersMap: Record<number, string> = {}

const matterEngines = {
    toml: {
        parse: (input: string) => toml.parse(input),
        stringify: (data: object) => toml.stringify(<toml.JsonMap>data),
    },
}

export class Terraformer {
    config: DraaftConfiguration
    publicationStateIds: number[]

    /**
     * Terraform pilot content to SSG content
     * @param config - Draaft configuration
     */
    constructor(config: DraaftConfiguration, publicationStateIds: number[]) {
        this.config = config
        this.publicationStateIds = publicationStateIds
    }

    matterize(content: string, frontmatter: Object) {
        return matter.stringify(content, frontmatter, {
            language: this.config.frontmatterFormat,
            engines: matterEngines,
            delimiters: this.config.frontmatterFormat == FrontmatterFormat.toml ? "+++" : "---",
        })
    }

    terraformChannel(channel: Channel, parentPath: string): void {
        let channelDirPath
        if (this.config.useChannelName) {
            let channelSlug = slugify(channel.name)
            channelDirPath = path.join(parentPath, channelSlug)
        } else {
            channelDirPath = parentPath
        }

        // Create channel directory
        write.ensureDir(channelDirPath)

        // Create _index.md file for channel root dir
        let frontmatter: any = _.cloneDeep(channel)
        if (this.config.ssg === SSGType.hugo) {
            frontmatter.title = channel.name
            delete frontmatter.name
            delete frontmatter.hierarchy
            delete frontmatter.children
        }
        let indexContent = this.matterize(String(frontmatter.description), frontmatter)
        write.createContentFile(channelDirPath, "_index.md", indexContent)

        this.writeChannelHierarchy(channel.hierarchy, channelDirPath)
    }

    writeChannelHierarchy(hierarchy: ChannelHierarchy, parentDirPath: string): void {
        for (let node of hierarchy) {
            if (node.type == "folder") {
                let folderPath = path.join(parentDirPath, slugify(node.name))
                write.ensureDir(folderPath)
                let indexContent = this.matterize(node.name, { title: node.name })
                write.createContentFile(folderPath, "_index.md", indexContent)

                this.writeChannelHierarchy(node.nodes, folderPath)
            }

            if (node.type == "item") {
                itemFoldersMap[node.id] = parentDirPath
            }
        }
    }

    /**
     * With a channel list and all items depending attached to it (on its children) build a directory of .md files
     * with a proper directory structure and filename pattern according to user config
     *
     * @param items : List of items attached to this channel
     */
    async terraformItems(items: Array<Item>): Promise<void> {
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

    async terraformOneItem(item: Item): Promise<void> {
        let itemFolder = itemFoldersMap[item.id]
        if (!itemFolder) {
            throw `Item ${item.id} has no correspondence in the hierarchy`
        }

        let itemDirPath = this.getItemDirPath(itemFolder, item)
        let itemFileName = this.getItemFileName(item)
        let itemFileContent = await this.getItemFileContent(item, itemDirPath)
        write.createContentFile(itemDirPath, itemFileName, itemFileContent)
    }

    /**
     * Build a filepath for content according to Hugo io local config (i18n)
     *
     * @param document : Draaft document returned by Api
     * @param options : Extension configuration object
     */
    getItemDirPath(parentFolder: string, item: Item): string {
        let itemDirPath = parentFolder
        // first level directory may be 'en' or 'fr' if user decides so
        if (this.config.i18nMode === I18nMode.directory) {
            // fr_FR -> fr
            let languageCode = item.language
                ? item.language.split("_")[0]
                : this.config.i18nDefaultLanguage
            itemDirPath = path.join(itemDirPath, languageCode)
        }

        if (this.config.bundlePages) {
            itemDirPath = path.join(itemDirPath, this.getItemSlug(item))
        }

        return itemDirPath
    }

    getItemSlug(item: Item) {
        return item.title ? `${item.id}-${slugify(item.title)}` : `${item.id}-notitle`
    }

    /**
     * Build a filepath for content according to Hugo io local config (i18n)
     *
     * @param item : Draaft document returned by Api
     * @param options : Extension configuration object
     */
    getItemFileName(item: Item): string {
        let itemFileName = this.config.bundlePages ? "index" : this.getItemSlug(item)

        if (this.config.i18nMode === I18nMode.filename && item.language) {
            let languageCode = item.language.split("_")[0] // fr_FR -> fr
            itemFileName = itemFileName + "." + languageCode + ".md"
        } else {
            itemFileName = itemFileName + ".md"
        }

        return itemFileName
    }

    /**
     * Prepare file contents before writing it
     *
     * @param item : Draaft item returned by Api
     */
    async getItemFileContent(item: any, itemDirPath: string): Promise<string> {
        // Everything from document is in frontmatter (for now, may be updated downwards)
        let frontmatter = _.cloneDeep(item)
        let markdown = ""

        // If we have a content field, use it for markdown source
        if (item.content.hasOwnProperty(this.config.contentFieldName)) {
            markdown = item.content[this.config.contentFieldName]
            markdown = await this.fetchImages(markdown, itemDirPath)
        }

        // Do we have a local content schema ?
        let typeFilePath = `.draaft/type-${frontmatter.item_type}.yml`
        let typefile: any
        if (fs.existsSync(typeFilePath)) {
            typefile = yaml.safeLoad(fs.readFileSync(typeFilePath, "utf8"))
        }

        if (typefile && typefile.content_schema) {
            signal.success("Custom type file found, using it")
            this.customiseFrontmatter(frontmatter, typefile.content_schema)
        } else {
            this.customiseFrontmatter(frontmatter)
        }

        return this.matterize(markdown, frontmatter)
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

        // Is it  published  or draft ?
        frontmatter.draft = !this.publicationStateIds.includes(frontmatter.workflow_state)

        return frontmatter
    }

    async fetchImages(markdown: string, itemDirPath: string): Promise<string> {
        let imagePromises = []

        for (let match of markdown.matchAll(MARKDOWN_IMAGE_REGEX)) {
            if (!match.groups || !match.groups.filename) {
                continue
            }

            let imageUrl = match.groups.filename.trim()
            let imageName = imageUrl.split("/").slice(-1)[0]
            // If we're bundling images with content, we use a relative ref.
            // Else, we'll put it into the statics directory, and use an absolute ref.
            let imageRefInMarkdown = this.config.bundlePages ? imageName : "/img/" + imageName
            markdown = markdown.replace(imageUrl, imageRefInMarkdown)

            let imagePromise = axios.get(imageUrl, { responseType: "stream" }).then((response) => {
                // If we're bundling images with content, we use the page bundle directory.
                // Else, we use the static directory.
                let imageDir = this.config.bundlePages ? itemDirPath : write.IMAGE_DIR
                write.createImageFile(imageDir, imageName, response)
            })
            imagePromises.push(imagePromise)
        }

        await Promise.all(imagePromises)

        return markdown
    }
}
