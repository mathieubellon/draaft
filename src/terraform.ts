import * as _ from 'lodash'
import * as matter from 'gray-matter'
import * as path from 'path'
import * as prepare from './prepare'
import * as write from './write'

import { Channel, DraaftConfiguration } from './types'

import { CLIError } from '@oclif/errors'
import { ensureDirSync } from 'fs-extra'
import { signal } from './signal'
import slugify = require('@sindresorhus/slugify')
const chalk = require('chalk')

function terraFormOneItem(channel: Channel, item: any, currentFolder: string, config: DraaftConfiguration){
  let cargo = prepare.fileContent(channel, item)
  let fullFilePath = prepare.fullFilePath(currentFolder, item, config)
  // We write synchronously to have a nice indented terminal output for user so, yes, trading speed for UX.
  // TODO : Build a report object from async calls to have best of both world.
  try {
    write.createFile(fullFilePath, cargo)
    signal.created(`📄 ${chalk.gray(fullFilePath)}`)
  } catch (error) {
    signal.fatal(error)
    throw new CLIError(error)
  }
}

/**
 * With a channel list and all items depending atteched to it (on its children) build a directory of .md files
 * with a proper folder structure and filename pattern according to user config
 *
 * @param channel : Channel selected by user
 * @param items : List of items attached to this channel and its children
 * @param parentPath : Parent directory to write files and dir in
 */
export function terraForm(channel: Channel, items: any[], parentPath: string, config: DraaftConfiguration): void {
  let channelSlug = slugify(channel.name)
  let currentFolder = path.join(parentPath, channelSlug)

  // Create section folder
  try {
    ensureDirSync(currentFolder)
    signal.created(`📁 ${currentFolder}`)
  } catch (error) {
    signal.fatal(`📁 ${currentFolder} not created`)
    throw new CLIError(error)
  }

  // Create _index.md file for folder
  try {
    let frontmatter: any = _.cloneDeep(channel)
    if (config.ssg === 'hugo') {
      frontmatter.title = channel.name
      delete frontmatter.name
      delete frontmatter.children
    }
    let indexContent = matter.stringify(String(frontmatter.description), frontmatter)
    write.createFile(path.join(currentFolder, '_index.md'), indexContent)
    signal.created(`📄 ${chalk.gray(currentFolder)}/_index.md`)
  } catch (error) {
    signal.fatal(error)
    throw new CLIError(error)
  }

  // Filter items for this channel
  let directItems = _.filter(items, item => {
    if (item.channels && item.channels.length > 0) {
      return item.channels.includes(channel.id)
    }
  })

  // Write items for this folder
  for( let item of directItems ){
    terraFormOneItem(channel, item, currentFolder, config)
    /*for( let translation of item.translations ){
      terraFormOneItem(channel, translation, currentFolder, config)
    }*/
  }

  // Recurse on sub channels
  for( let subChannel of channel.children ){
    terraForm(subChannel, items, currentFolder, config)
  }
}
