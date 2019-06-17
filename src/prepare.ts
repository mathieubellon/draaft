import * as _ from 'lodash';
import * as interf from './interfaces';
import * as matter from 'gray-matter';
import * as path from 'path';
import * as slugify from '@sindresorhus/slugify';

/**
 * Prepare filename depending on user decision while configurin hugo (mainly i18n related)
 * filename.md OR filename.en.md
 *
 * @param document : Draaft document returned by Api
 * @param options : Extension configuration object
 */
export function filename(document: any, options: interf.CLIConfig): string {
  let buildedFileName = document.title ? slugify(document.title) : `notitle-${slugify(document.id)}`
  // Append correct extension
  if (options.i18nActivated && options.i18nContentLayout === 'byfilename' && document.language) {
    let languageCode = document.language.split("_")[0] // fr_FR -> fr
    buildedFileName = buildedFileName + '.' + languageCode + '.md'
  } else {
    // Content language can be set by folder structure or front matter property
    // so leave filemane agnostic
    buildedFileName = buildedFileName + '.md'
  }
  return buildedFileName;
}

/**
 * Build a filepath for content according to Hugo io local config (i18n) 
 *
 * @param document : Draaft document returned by Api
 * @param options : Extension configuration object
 */
export function fullFilePath(inFolder: string, document: any, options: interf.CLIConfig): string {
  let buildedFilePath = inFolder;
  // first level folder may be 'en' or 'fr' if user decides so
  if (options.i18nActivated && options.i18nContentLayout === 'byfolder') {
    let languageCode = document.language ? document.language.split("_")[0] : options.defaultLanguage; // fr_FR -> fr
    buildedFilePath = buildedFilePath + '/' + languageCode
  }
  // Depending on channels from draaft we need to create subfolders
  // if (options.excludeTopFolder) {
  //     folders.shift()
  // }
  let buildedFileName = document.title ? `${slugify(document.title)}-${document.id}` : `notitle-${document.id}`
  // Append correct extension
  if (options.i18nActivated && options.i18nContentLayout === 'byfilename' && document.language) {
    let languageCode = document.language.split("_")[0] // fr_FR -> fr
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
  let bodymarkdown;
  delete document.channels
  document.hierarchy = channel.hierarchy
  document.channel = channel.name
  // FIXME content field is maybe something else than body
  if (document.cargo.body && document.cargo.body !== "") {
    bodymarkdown = document.cargo.body;
  }
  delete document.cargo
  let cargoToWrite = matter.stringify(`\n${bodymarkdown}`, document);
  return cargoToWrite
}