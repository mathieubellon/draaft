import * as matter from 'gray-matter'
import * as slugify from '@sindresorhus/slugify'
import * as _ from 'lodash'
import * as fs from 'fs-extra'

import { DraaftConfiguration } from './types'

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

/**
 * Prepare file contents before writing it
 *
 * @param channel : Channel document is attached to
 * @param document : Draaft document returned by Api
 */
export function fileCargo(channel: any, document: any): string {

  let bodymarkdown = ''
  let newdoc = _.cloneDeep(document)

  // Check if type frontmapper exists
  const typemapp = JSON.parse(fs.readFileSync('.draaft/type614.json', 'utf8'))

  console.log(typemapp)

  typemapp.mapper.forEach((element: any) => {
    if (element.name !== element.frontmatter) {
      console.log(element)
      _.set(newdoc, element.frontmapper, document[element.name])
      _.unset(newdoc, element.name)
    }
  })


  delete newdoc.channels
  //document.menu = channel.name
  newdoc.channel = channel.name
  // FIXME content field is maybe something else than body
  if (document.cargo.body && document.cargo.body !== '') {
    bodymarkdown = document.cargo.body
  }
  delete newdoc.cargo
  delete newdoc.tags
  newdoc.tags = []
  document.tags.forEach((tag: any) => {
    newdoc.tags.push(tag.name)
  })
  let cargoToWrite = matter.stringify(bodymarkdown, newdoc)
  return cargoToWrite
}
