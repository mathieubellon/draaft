import {prompt} from 'inquirer'

export const askToken = () => {
  return prompt({
    type: 'input',
    name: 'token',
    message: 'What is your token?'
  })
}