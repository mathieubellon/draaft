import { prompt, registerPrompt } from "inquirer"
import * as _ from "lodash"
import { Channel } from "./types"

registerPrompt("fuzzypath", require("inquirer-fuzzy-path"))

export const confirmAction = (confirmMessage = "Are you sure ?") => {
    return prompt({
        type: "confirm",
        name: "confirm",
        message: confirmMessage,
    })
}

export const askToken = () => {
    return prompt({
        type: "password",
        name: "apiToken",
        message: "What is your API token?",
        mask: "*",
    })
}

/**
 * Ask user which channel to pull content from
 * @param {string} channels - Channels list
 * @returns {*}
 */
export const askChannels = (channels: Channel[]) => {
    let choices = _.map(channels, (elt) => {
        return {
            name: elt.name,
            value: elt.id,
        }
    })
    return prompt([
        {
            name: "channel",
            message: "Select a channel to pull content from\n",
            type: "list",
            choices: choices,
        },
    ])
}

export const askDestDir = () => {
    return prompt([
        {
            type: "fuzzypath",
            name: "path",
            // @ts-ignore
            excludePath: (nodePath) =>
                nodePath.startsWith(".git") ||
                nodePath.startsWith("node") ||
                nodePath.startsWith(".draaft"),
            // excludePath :: (String) -> Bool
            // excludePath to exclude some paths from the file-system scan
            itemType: "directory",
            // itemType :: 'any' | 'directory' | 'file'
            // specify the type of nodes to display
            // default value: 'any'
            // example: itemType: 'file' - hides directories from the item list
            rootPath: "./",
            // rootPath :: String
            // Root search directory
            message: "Select a destination directory where we will download your content to :",
            default: "./",
            suggestOnly: false,
            // suggestOnly :: Bool
            // Restrict prompt answer to available choices or use them as suggestions
        },
    ])
}
