draaft-cli
==========

Draaft cli to extract to local dir content as md files

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/draaft-cli.svg)](https://npmjs.org/package/draaft-cli)
[![CircleCI](https://circleci.com/gh/draaft/cli/tree/master.svg?style=shield)](https://circleci.com/gh/draaft/cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/draaft-cli.svg)](https://npmjs.org/package/draaft-cli)
[![License](https://img.shields.io/npm/l/draaft-cli.svg)](https://github.com/draaft/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g draaft-cli
$ draaft COMMAND
running command...
$ draaft (-v|--version|version)
draaft-cli/0.0.0 darwin-x64 node-v12.4.0
$ draaft --help [COMMAND]
USAGE
  $ draaft COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`draaft pull [FILE]`](#pull-channels-file)
* [`draaft help [COMMAND]`](#draaft-help-command)

## `draaft pull [FILE]`

describe the command here

```
USAGE
  $ draaft pull [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/pull.ts](https://github.com/draaft/cli/blob/v0.0.0/src/commands/pull.ts)_

## `draaft help [COMMAND]`

display help for draaft

```
USAGE
  $ draaft help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_
<!-- commandsstop -->
