import * as slugify from '@sindresorhus/slugify'
import * as fs from 'fs-extra'
import * as matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as _ from 'lodash'
import * as path from 'path'
import {signal} from './signal'
import {DraaftConfiguration, Item} from './types'

/**
 * Build a filepath for content according to Hugo io local config (i18n)
 *
 * @param document : Draaft document returned by Api
 * @param options : Extension configuration object
 */
export function getItemDirPath(parentFolder: string, item: Item, options: DraaftConfiguration): string {
    let itemDirPath = parentFolder
    // first level folder may be 'en' or 'fr' if user decides so
    if (options.i18nActivated && options.i18nContentLayout === 'byfolder') {
        let languageCode = item.language ? item.language.split('_')[0] : options.i18nDefaultLanguage // fr_FR -> fr
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
export function getItemFileName(item: Item, options: DraaftConfiguration): string {
    let itemFileName = item.title ? `${item.id}-${slugify(item.title)}` : `${item.id}-notitle`
    // Append correct extension
    if (options.i18nActivated && options.i18nContentLayout === 'byfilename' && item.language) {
        let languageCode = item.language.split('_')[0] // fr_FR -> fr
        itemFileName = itemFileName + '.' + languageCode + '.md'
    } else {
        // Content language can be set by folder structure or front matter property
        // so leave filemane agnostic
        itemFileName = itemFileName + '.md'
    }
    return itemFileName
}

// Take a source content object as map it with local custom content schema
function customiseFrontmatter(frontmatter: any, schema?: any): any {
    delete frontmatter.channels
    delete frontmatter.targets
    let customTags: any[] = []
    frontmatter.tags.forEach((tag: any) => {
        customTags.push(tag.name)
    })
    frontmatter.tags = customTags
    // content body doit virer comme si schema en custom sauf si en schema c'est true
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
    } else {
        if (frontmatter.content.body) {
            delete frontmatter.content.body
        }
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

/**
 * Prepare file contents before writing it
 *
 * @param item : Draaft item returned by Api
 */
export function fileContent(item: any): string {
    // Everything from document is in frontmatter (for now, may be updated downwards)
    let frontmatter = _.cloneDeep(item)
    let markdown = ''

    // If we have a body in content use it for markdown source
    if (item.content.body) {
        markdown = item.content.body
    }

    // Do we have a local content schema ?
    let typeFilePath = `.draaft/type-${frontmatter.item_type}.yml`
    let typefile: any
    if (fs.existsSync(typeFilePath)) {
        typefile = yaml.safeLoad(fs.readFileSync(typeFilePath, 'utf8'))
    }

    if (typefile && typefile.content_schema) {
        signal.success('Custom type file found, using it')
        customiseFrontmatter(frontmatter, typefile.content_schema)
    } else {
        customiseFrontmatter(frontmatter)
    }

    return matter.stringify(markdown, frontmatter)
}
