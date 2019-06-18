
import { Channel } from './types'
import * as _ from 'lodash'
import * as path from 'path'
import * as prepare from './prepare'
import * as write from './write'
import Config from './config'
import slugify = require('@sindresorhus/slugify')

/**
 * With a channel list and all items depending atteched to it (on its children) build a directory of .md files
 * with a proper folder structure and filename pattern according to user config
 *
 * @param channel : Channel selected by user
 * @param items : List of items attached to this channel and its children
 * @param parentPath : Parent directory to write files and dir in
 */
export function terraForm(channel: Channel, items: any[], parentPath: string): void {
  let indentation = '   '.repeat(channel.level)
  let channelslug = slugify(channel.name)
  let currentFolder = path.join(parentPath, channelslug)

  write.createFolder(currentFolder)
    .then(() => {
      console.log(`✅ ${indentation} 📁 ${slugify(channel.name)}`)
      let directItems = _.filter(items, item => {
        if (item.channels && item.channels.length > 0) {
          return item.channels.includes(channel.id)
        }
      })
      directItems.forEach(element => {
        let cargo = prepare.fileCargo(channel, element)
        let fullFilePath = prepare.fullFilePath(currentFolder, element, Config)
        write.createFile(fullFilePath, cargo).then(() => {
          console.log(`✅ ${indentation} 📄 ${currentFolder} ${prepare.filename(element, Config)}`)
        }).catch(error => {
          console.log('Could not create file : ' + error)
        })
      })
    })
    .catch(error => {
      console.error('Could not create channel folder : ' + error)
    })
  //if (channel.children.length === 0) { return }
  channel.children.forEach(child => {
    terraForm(child, items, currentFolder)
  })
}