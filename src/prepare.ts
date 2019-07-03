import * as matter from 'gray-matter'
import * as slugify from '@sindresorhus/slugify'
import * as _ from 'lodash'
import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { DraaftConfiguration } from './types'
import { signal } from './signal';

/**
 * Prepare filename depending on user decision while configurin hugo (mainly i18n related)
 * filename.md OR filename.en.md
 *
 * @param document : Draaft document returned by Api
 * @param options : Extension configuration object
 */
export function filename(document: any, options: DraaftConfiguration): string {
  let buildedFileName = document.title ? slugify(document.title) : `notitle-${document.id}`
  // Append correct extension
  if (options.i18nActivated && options.i18nContentLayout === 'byfilename' && document.language) {
    let languageCode = document.language.split('_')[0] // fr_FR -> fr
    buildedFileName = buildedFileName + '.' + languageCode + '.md'
  } else {
    // Content language can be set by folder structure or front matter property
    // so leave filemane agnostic
    buildedFileName = buildedFileName + '.md'
  }
  return buildedFileName
}

/**
 * Build a filepath for content according to Hugo io local config (i18n)
 *
 * @param document : Draaft document returned by Api
 * @param options : Extension configuration object
 */
export function fullFilePath(inFolder: string, document: any, options: DraaftConfiguration): string {
  let buildedFilePath = inFolder
  // first level folder may be 'en' or 'fr' if user decides so
  if (options.i18nActivated && options.i18nContentLayout === 'byfolder') {
    let languageCode = document.language ? document.language.split('_')[0] : options.i18nDefaultLanguage // fr_FR -> fr
    buildedFilePath = buildedFilePath + '/' + languageCode
  }
  // Depending on channels from draaft we need to create subfolders
  // if (options.excludeTopFolder) {
  //     folders.shift()
  // }
  let buildedFileName = document.title ? `${document.id}-${slugify(document.title)}` : `${document.id}-notitle`
  // Append correct extension
  if (options.i18nActivated && options.i18nContentLayout === 'byfilename' && document.language) {
    let languageCode = document.language.split('_')[0] // fr_FR -> fr
    buildedFileName = buildedFileName + '.' + languageCode + '.md'
  } else {
    // Content language can be set by folder structure or front matter property
    // so leave filemane agnostic
    buildedFileName = buildedFileName + '.md'
  }
  return buildedFilePath + '/' + buildedFileName
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
  // cargo body doit virer comme si schema en custom sauf si en schema c'est true
  if (schema) {
    // schema will only customise 'frontmatter.cargo' key, not frontmatter
    for (let key of Object.keys(frontmatter.cargo)) {
      // Do not show in frontmatter
      if (schema[key].fm_show === false) {
        delete frontmatter.cargo[key]
      }
      // Rename key in frontmatter
      if (key !== schema[key].fm_key) {
        let newKey = schema[key].fm_key
        let oldKey = key
        frontmatter.cargo[newKey] = frontmatter.cargo[oldKey]
        delete frontmatter.cargo[oldKey]
      }
    }
  }
  return frontmatter
}

/**
 * Prepare file contents before writing it
 *
 * @param channel : Channel document is attached to
 * @param document : Draaft document returned by Api
 */
export function fileContent(channel: any, document: any): string {
  
  // Everything from document is in frontmatter (for now, may be updated downwards)
  let frontmatter = _.cloneDeep(document)
  let markdown = ''
  

  // If we have a body in content use it for markdown source
  if (document.cargo.body && document.cargo.body !== '') {
    markdown = document.cargo.body
  }

  // Do we have a local content schema ?
  let typeFilePath = `.draaft/type-${ frontmatter.item_type }.yml`
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


  let cargoToWrite = matter.stringify(markdown, frontmatter)
  return cargoToWrite
}
