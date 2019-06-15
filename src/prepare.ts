import * as matter from 'gray-matter';
import * as path from 'path';
import * as interf from './interfaces';

import * as slugify from '@sindresorhus/slugify';
import * as _ from 'lodash';

/**
* Prepare filename depending on user decision while configurin hugo (mainly i18n related)
* filename.md OR filename.en.md
*
* @param document : Draaft document returned by Api
* @param options : Extension configuration object
*/
export function filename(document: any, options: interf.ExtensionConfig): string {
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
export function filepath(inFolder: string, document: any, options: interf.ExtensionConfig): string {
    let buildedFilePath = inFolder;
    // first level folder may be 'en' or 'fr' if user decides so
    if (options.i18nActivated && options.i18nContentLayout === 'byfolder') {
        let languageCode = document.language ? document.language.split("_")[0] : options.defaultLanguage; // fr_FR -> fr
        buildedFilePath = buildedFilePath + '/' + languageCode
    }
    // Depending on channels from draaft we need to create subfolders
    if (document.channel && document.channel.hierarchy) {
        let channels = document.channel.hierarchy;
        let folders = _.split(channels, ' / ');
        if(options.excludeTopFolder){
           folders.shift()
        }
        buildedFilePath = buildedFilePath + '/' + _.join(folders,'/');
    }
    return buildedFilePath;
}

/**
* Prepare file contents before writing it
*
* @param filepath : path where to write the file
* @param filename : name of file
* @param document : Draaft document returned by Api
*/
export function fileCargo(filepath: string, filemane: string, document: any): string {
    let bodymarkdown;
    if (document.channel){
        document.hierarchy = document.channel.hierarchy
        document.channel = document.channel.name
    }
    // FIXME content field is maybe something else than body
    if (document.cargo.body && document.cargo.body !== "") {
        bodymarkdown = document.cargo.body;
    }
    delete document.cargo.body
    let cargoToWrite = matter.stringify(`\n${bodymarkdown}`, document);
    return cargoToWrite
}