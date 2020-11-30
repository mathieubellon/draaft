import Command from '@oclif/command'
import * as Conf from 'conf'
import * as _ from 'lodash'
import * as ora from 'ora'
import DraaftAPI from './api'
import {defaultConfiguration} from './config'
import {DraaftConfiguration} from './types'

const conf = new Conf({
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
    draaftConfig!: DraaftConfiguration
    api: any

    async init() {
        if (!conf.has('token') || conf.get('token') === '') {
            const {askToken} = require('./prompts')
            const {token} = await askToken()
            this.setToken('token', token)
        }
        this.draaftConfig = _.merge(defaultConfiguration, conf.store)
        conf.store = this.draaftConfig
        this.api = new DraaftAPI(this.draaftConfig)
        this.spinner = ora()
    }

    getToken(key: string) {
        conf.get(key)
    }

    setToken(key: string, value: string) {
        conf.set(key, value)
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
