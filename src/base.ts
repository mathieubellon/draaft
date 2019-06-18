// src/base.ts
import Command, { flags } from '@oclif/command'
import * as Conf from 'conf'
import axios from 'axios'

const config = new Conf({
  projectName: 'draaft',
  configName: 'draaftconfig',
  cwd: process.cwd(),
})


export default abstract class extends Command {
  // static flags = {
  //   loglevel: flags.string({ options: ['error', 'warn', 'info', 'debug'] })
  // }
  token: string
  $axios: any

  async init() {
    let API_TOKEN = ''

    if (config.has('token')) {
      API_TOKEN = config.get('token')
    } else {
      const { askToken } = require('./prompts')
      const { token } = await askToken()
      this.setToken('token', token)
      API_TOKEN = token
    }

    this.token = API_TOKEN
    this.$axios = axios.create({
      headers: {
        Authorization: `Token ${API_TOKEN}`
      }
    })
  }

  getToken(key: string) {
    config.get(key)
  }

  deleteToken(key: string) {
    config.delete(key)
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