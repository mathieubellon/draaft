import {flags} from '@oclif/command'
import * as yaml from 'js-yaml'
import * as path from 'path'
import {BaseCommand} from '../base'
import {signal} from '../signal'
import {createFile, createFileSafe} from '../write'

export default class States extends BaseCommand {
    static description = 'List all workflow states'

    static flags = {
        help: flags.help({char: 'h'}),
        save: flags.boolean({char: 's', description: 'Save states as file for customisation'}),
        backup: flags.boolean({char: 'b', description: 'If file exists create backup'}),
    }

    async run() {
        const {flags} = this.parse(States)
        // Get workflow states list
        let statesList = []
        try {
            this.spinner.start('Get workflow states list')
            let firstPage = await this.api.workflowGetAll()
            statesList = firstPage.results
            this.spinner.succeed('Workflow states list downloaded')
            this.log('This list represents all workflow states created by the user \n ==========================')
        } catch (error) {
            this.spinner.fail('Error while downloading workflow states list')
            signal.fatal(error)
            this.exit(1)
        }
        statesList.forEach((state: any) => {
            this.log(`🏳   ${state.label} [id:${state.id}]`)
        })
        if (flags.save) {
            let writePath = path.join(process.cwd(), '.draaft', 'states.yml')
            statesList.forEach((element: any) => {
                element.is_draft = true
            })
            if (flags.backup) {
                createFileSafe(writePath, yaml.safeDump(statesList))
            } else {
                createFile(writePath, yaml.safeDump(statesList))
            }
        }
    }
}
