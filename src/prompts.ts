import {prompt} from 'inquirer'
import { Channel } from './types'
import * as _ from 'lodash'

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