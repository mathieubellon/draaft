import {prompt, registerPrompt} from 'inquirer'
import { Channel } from './types'
import * as _ from 'lodash'

registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

export const askToken = () => {
  return prompt({
    type: 'input',
    name: 'token',
    message: 'What is your token?'
  })
}

/**
 * Ask user which channel to pull content from
 * @param {string} channels - Channels list
 * @returns {*}
 */
export const askChannels = (channels: Channel[]) => {
  let choices = _.map(channels, elt => {
    return {
      name: elt.hierarchy,
      value: elt.id
    }
  })
  return prompt([{
    name: 'channel',
    message: 'Select a channel to pull content from\n',
    type: 'list',
    choices: choices,
  }])
}

export const askDestDir = () => {
  return prompt([
    {
      type: 'fuzzypath',
      name: 'path',
      excludePath: nodePath => nodePath.startsWith('.git') || nodePath.startsWith('node'),
        // excludePath :: (String) -> Bool
        // excludePath to exclude some paths from the file-system scan
      itemType: 'directory',
        // itemType :: 'any' | 'directory' | 'file'
        // specify the type of nodes to display
        // default value: 'any'
        // example: itemType: 'file' - hides directories from the item list
      rootPath: './',
        // rootPath :: String
        // Root search directory
      message: 'Select a destination folder where we will download your content to :',
      default: './',
      suggestOnly: false,
        // suggestOnly :: Bool
        // Restrict prompt answer to available choices or use them as suggestions
    }
  ])
}

