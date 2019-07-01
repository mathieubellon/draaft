import * as Conf from 'conf'
import * as _ from 'lodash'
import * as ora from 'ora'

import Command from '@oclif/command'
import { DraaftConfiguration } from './types'
import { defaultconfiguration } from './config'
import draaftapi from './api'

const config = new Conf({
  projectName: 'draaft',
  configName: 'config',
  cwd: './.draaft'
})

export abstract class BaseCommand extends Command {
  // static flags = {
  //   loglevel: flags.string({ options: ['error', 'warn', 'info', 'debug'] })
  // }
  token!: string
  spinner: any
  configuration!: DraaftConfiguration
  api: any

  async init() {
    if (!config.has('token') || config.get('token') === '') {
      const { askToken } = require('./prompts')
      const { token } = await askToken()
      this.setToken('token', token)
    }
    this.configuration = _.merge(defaultconfiguration, config.store)
    config.store = this.configuration
    this.api = new draaftapi(this.configuration)
    this.spinner = ora()
  }

  getToken(key: string) {
    config.get(key)
  }

  setToken(key: string, value: string) {
    config.set(key, value)
  }
}

// // src/commands/mycommand.ts
// import Command from '../base'

// export class MyCommand extends Command {
//   static flags = {
//     ...Command.flags,
//     extraflag: flags.string()
//   }

//   async run() {
//     this.log('information', 'info')
//     this.log('uh oh!', 'error')
//   }
// }
