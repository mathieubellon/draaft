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
draaft-cli/0.0.1 darwin-x64 node-v12.4.0
$ draaft --help [COMMAND]
USAGE
  $ draaft COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`draaft help [COMMAND]`](#draaft-help-command)
* [`draaft pull [FILE]`](#draaft-pull-file)

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

## `draaft pull [FILE]`

Pull content from a platform channel. Build in destination folder acording to selected layout (only hugo.io at the moment)

```
USAGE
  $ draaft pull [FILE]

OPTIONS
  -e, --excludeTopFolder  [default: hugo] Whether or not create a folder for the top directory
  -h, --help              show CLI help
  -o, --overwrite         [default: false] If destination folder exists empty it before building
  --channel=channel       Channel to pull content from [int]
  --ssg=hugo|gatsby       [default: hugo] Your static site generator.
```

_See code: [src/commands/pull.ts](https://github.com/draaft/cli/blob/v0.0.1/src/commands/pull.ts)_
<!-- commandsstop -->
