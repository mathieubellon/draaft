draaft-cli
==========

[Pilot](https://pilot.pm) is a content production platform for marketing or communication teams. Draaft is a command line tool that simply allows you to retrieve the content produced on Pilot for static site generators. 


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/draaft-cli.svg)](https://npmjs.org/package/draaft-cli)
[![CircleCI](https://circleci.com/gh/draaft/cli/tree/master.svg?style=shield)](https://circleci.com/gh/draaft/cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/draaft-cli.svg)](https://npmjs.org/package/draaft-cli)
[![License](https://img.shields.io/npm/l/draaft-cli.svg)](https://github.com/draaft/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Roadmap](#roadmap)
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
- [draaft-cli](#draaft-cli)
- [Usage](#Usage)
- [Commands](#Commands)
  - [`draaft help [OPTIONS]`](#draaft-help-OPTIONS)
  - [`draaft layout [OPTIONS]`](#draaft-layout-OPTIONS)
  - [`draaft pull [OPTIONS]`](#draaft-pull-OPTIONS)
  - [`draaft states [OPTIONS]`](#draaft-states-OPTIONS)
  - [`draaft types [OPTIONS]`](#draaft-types-OPTIONS)
- [Roadmap](#Roadmap)
  - [Alpha](#Alpha)
  - [Beta](#Beta)
  - [V1.0.0](#V100)

## `draaft help [OPTIONS]`

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

## `draaft layout [OPTIONS]`

Create basic layout to display content

```
USAGE
  $ draaft layout [OPTIONS]

OPTIONS
  -f, --overwrite
  -h, --help       show CLI help
  -s, --ssg=ssg    Static site generator
```

_See code: [src/commands/layout.ts](https://github.com/draaft/cli/blob/v0.0.1/src/commands/layout.ts)_

## `draaft pull [OPTIONS]`

Pull content and create files on disk

```
USAGE
  $ draaft pull

OPTIONS
  -h, --help         show CLI help
  -n, --notopfolder  Do not create a folder for the top directory
  -o, --overwrite    Empty destination folder before writing
  --channel=channel  Channel to pull content from [int]
  --dest=dest        Destination folder where to write files
  --ssg=hugo|gatsby  [default: hugo] Your static site generator.
```

_See code: [src/commands/pull.ts](https://github.com/draaft/cli/blob/v0.0.1/src/commands/pull.ts)_

## `draaft states [OPTIONS]`

List all workflow states

```
USAGE
  $ draaft states [OPTIONS]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/states.ts](https://github.com/draaft/cli/blob/v0.0.1/src/commands/states.ts)_

## `draaft types [OPTIONS]`

List all content types

```
USAGE
  $ draaft types [OPTIONS]

OPTIONS
  -h, --help       show CLI help
  -s, --showcargo  Display content schema for each type
```

_See code: [src/commands/types.ts](https://github.com/draaft/cli/blob/v0.0.1/src/commands/types.ts)_
<!-- commandsstop -->

# Roadmap

## Alpha
- [x] Get content from channel
- [x] hugo.io : Create _index.file for sections
- [x] generate basic Hugo layout
- [ ] Data mapper : let user map Draaft response keys to Frontmatter (use Hugo archetype maybe)
- [ ] Basic documentation
## Beta
- [ ] Select which pilot.pm workflow state map with the "draft" frontmatter key in Hugo
- [ ] Generate data files for complex layout (eg. home page)
- [ ] Generate page bundles
- [ ] Option : Flat layout (with frontmatter menu infos + hierarchy)
- [ ] Option : Merge frontmatter
- [ ] hugo.io : i18n support
## V1.0.0
- [ ] Support Gatsby
- [ ] Generate complete layout for Hugo and Gatsby with theme selector
- [ ] Tests
