const {Signale} = require('signale');

const options = {
  disabled: false,
  interactive: false,
  logLevel: 'info',
  //scope: 'draaft',
  secrets: [],
  stream: process.stdout,
  types: {
    update: {
      badge: '♻',
      color: 'green',
      label: 'updated',
      logLevel: 'info'
    },
    terraforming: {
      badge: '🏗',
      color: 'blue',
      label: 'terraforming',
      logLevel: 'info'
    }
  }
};

export const customSignal = new Signale(options)