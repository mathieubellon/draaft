Draaft
==========

Draaft is a command line tool that simply allows you to retrieve content produced on Pilot for statics sites generators. [Pilot](https://pilot.pm) is a content production platform for marketing or communication teams.  

🚨 ⚠ **Alpha version : This cli is absolutely not production ready and API is subject to changes** ⚠ 🚨

<!-- [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/draaft.svg)](https://npmjs.org/package/draaft)
[![CircleCI](https://circleci.com/gh/draaft/cli/tree/master.svg?style=shield)](https://circleci.com/gh/draaft/cli/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/draaft.svg)](https://npmjs.org/package/draaft)
[![License](https://img.shields.io/npm/l/draaft.svg)](https://github.com/draaft/cli/blob/master/package.json) -->

<!-- toc -->
* [Installing](#installing)
* [Usage](#usage)
* [Configuration](#configuration)
* [Commands](#commands)
* [Roadmap](#roadmap)
<!-- tocstop -->

# Installing

Using npm:

```bash
$ npm install -g draaft
```

Using yarn:

```bash
$ yarn global add draaft
```

# Usage

<!-- usage -->
```bash
$ draaft layout
$ draaft pull --channel=CHANNEL_ID --dest=content
```
<!-- usagestop -->

# Configuration

A configuration file with sensible defaults will be created for you in `.draaft/config.json` when you execute a first command. 

```js
{
    // "http" or "https"
    "apiScheme": "https",
    
    // The host of the API endpoint
    "apiHost": "app.pilot.pm",

    // The base path of the API endpoint.
    // You can change this value to force a specific version of the API. 
    "apiBasePath": "/integrations/beta",
    
    // The secret API token to authenticate yourself in the API
    "apiToken": "secretToken",
	   
    // Should we make page bundles ?
    // If `true`, draaft will create a bundle for each item, containing the content and resources (images).
    // If `false`, all the resources will be created in the `/static/` directory
    "bundlePages": true,

    // The name of the field in `Item.content` that will be used for the page content.
    "contentFieldName": "body",
    
    // How should we serialize the frontmatter ?
    // Allowed values : "yaml" | "toml"
    "frontmatterFormat": "yaml"

    // Should we handle item translations, and if yes with which organization ?
    // Allowed values : "none" | "directory" | "filename"
    "i18nMode": "none",

    // When i18n is activated, and an item has no language defined, fallback on `i18nDefaultLanguage`
    "i18nDefaultLanguage": "en",

    // Should we create a top-directory with the channel name ?
    // If `true`, draaft will create all files into `/[destDir]/[channel.name]/`
    // If `false`, draaft will create all files into `/[destDir]/`
    "useChannelName": false,
    
    //Target Static Site Generator.
    // For now, only "hugo" is supported
    "ssg": "hugo"
}
```

# Commands

<!-- commands -->
* [`draaft help [COMMAND]`](#draaft-help-command)
* [`draaft layout`](#draaft-layout)
* [`draaft pull`](#draaft-pull)
* [`draaft states`](#draaft-states)
* [`draaft types [ID]`](#draaft-types-id)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src\commands\help.ts)_

## `draaft layout`

Create basic layout to display content

```
USAGE
  $ draaft layout

OPTIONS
  -f, --overwrite
  -h, --help       show CLI help
  -s, --ssg=ssg    Static site generator
```

_See code: [src\commands\layout.ts](https://github.com/hbyio/draaft/blob/v0.0.1-alpha2/src\commands\layout.ts)_

## `draaft pull`

Pull content and create files on disk

```
USAGE
  $ draaft pull

OPTIONS
  -h, --help         show CLI help
  -o, --overwrite    Empty destination directory before writing
  --channel=channel  Channel to pull content from [int]
  --dest=dest        Destination directory where to write files
  --ssg=hugo|gatsby  [default: hugo] Your static site generator.
```

_See code: [src\commands\pull.ts](https://github.com/hbyio/draaft/blob/v0.0.1-alpha2/src\commands\pull.ts)_

## `draaft states`

List all workflow states

```
USAGE
  $ draaft states

OPTIONS
  -b, --backup  If file exists create backup
  -h, --help    show CLI help
  -s, --save    Save states as file for customisation
```

_See code: [src\commands\states.ts](https://github.com/hbyio/draaft/blob/v0.0.1-alpha2/src\commands\states.ts)_

## `draaft types [ID]`

List all item types

```
USAGE
  $ draaft types [ID]

ARGUMENTS
  ID  ID of type

OPTIONS
  -b, --backup  If file exists create backup
  -h, --help    show CLI help
  -s, --save    Save content shema as file for customisation
  -w, --schema  Display content schema for each type
```

_See code: [src\commands\types.ts](https://github.com/hbyio/draaft/blob/v0.0.1-alpha2/src\commands\types.ts)_
<!-- commandsstop -->

# Roadmap

## Alpha
- [x] Get content from channel
- [x] hugo.io : Create _index.file for sections
- [x] generate basic Hugo layout
- [x] Data mapper : let user map Draaft response keys to Frontmatter (use Hugo archetype maybe)
- [X] Generate page bundles
- [X] Basic documentation
## Beta
- [ ] Generate data files for complex layout (eg. home page)
- [ ] Option : Flat layout (with frontmatter menu infos + hierarchy)
- [ ] Option : Merge frontmatter
- [ ] hugo.io : i18n support
- [ ] Select which pilot.pm workflow state map with the "draft" frontmatter key in Hugo
## V1.0.0
- [ ] Support Gatsby
- [ ] Generate complete layout for Hugo and Gatsby with theme selector
- [ ] Tests
