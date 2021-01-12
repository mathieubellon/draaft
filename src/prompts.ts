import { prompt, registerPrompt } from "inquirer"
import * as _ from "lodash"
import { Channel, WorkflowState } from "./types"

registerPrompt("fuzzypath", require("inquirer-fuzzy-path"))

export function askToken() {
    return prompt({
        type: "password",
        name: "apiToken",
        message: "What is your API token?",
        mask: "*",
    })
}

/**
 * Ask user which channel to pull content from
 * @param {string} channelsList - Channels list
 * @returns {*}
 */
export function askChannels(channelsList: Channel[]): Promise<{ channel: number[] }> {
    let choices = _.map(channelsList, (channel) => {
        return {
            name: channel.name,
            value: channel.id,
        }
    })
    return prompt([
        {
            name: "channel",
            message: "Select channels to pull content from\n",
            type: "checkbox",
            choices: choices,
        },
    ])
}

/**
 * Ask user which workflow states should define a content as published ( draft = false )
 * @param {string} statesList - WorkflowState list
 * @returns {*}
 */
export function askPublicationStates(
    statesList: WorkflowState[],
): Promise<{ workflowState: number[] }> {
    let choices = _.map(statesList, (state) => {
        return {
            name: state.label,
            value: state.id,
        }
    })
    return prompt([
        {
            name: "workflowState",
            message: "Select which workflow state to use for publication\n",
            type: "checkbox",
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
                nodePath.startsWith("node_modules") ||
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
