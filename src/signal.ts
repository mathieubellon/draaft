const {Signale} = require('signale')

const options = {
    disabled: false,
    interactive: false,
    logLevel: 'info',
    //scope: 'draaft',
    secrets: [],
    stream: process.stdout,
    types: {
        created: {
            badge: '✔',
            color: 'green',
            label: 'created',
            logLevel: 'info'
        },
        updated: {
            badge: '♻',
            color: 'yellow',
            label: 'updated',
            logLevel: 'info'
        },
        terraforming: {
            badge: '🏗',
            color: 'blue',
            label: 'build',
            logLevel: 'info'
        }
    }
}

export const signal = new Signale(options)
