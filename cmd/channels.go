/*
Copyright © 2019 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/spf13/cobra"
)

// Channel is used to handle channels/ endpoint Response
type Channel struct {
	ID        int             `json:"id"`
	Name      string          `json:"name"`
	Hierarchy string          `json:"hierarchy"`
	Children  json.RawMessage `json:"children"`
	Level     int             `json:"level"`
}

// ResponseChannels handle API response
type ResponseChannels []Channel

// channelsCmd represents the channels command
var channelsCmd = &cobra.Command{
	Use:   "channels",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("channels called")
		// APIURL := "http://127.0.0.1:8000/public_api/pre-alpha"
		// PATH := "/channels/133"
		url := "http://127.0.0.1:8000/public_api/pre-alpha/channels/133"

		// Build the request
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Fatal("Error reading request. ", err)
		}

		req.Header.Set("Cache-Control", "no-cache")
		req.Header.Set("Authorization", "Token 0.0005775177851319313")
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: time.Second * 10}

		resp, err := client.Do(req)
		if err != nil {
			log.Fatal("Error reading response. ", err)
		}
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal("Error reading body. ", err)
		}

		fmt.Printf("%s\n", body)
		keys := []Channel{}
		jsonErr := json.Unmarshal(body, &keys)
		if jsonErr != nil {
			log.Fatal(jsonErr)
		}
		for _, channel := range keys {
			fmt.Println(channel.Name)
		}

		// fmt.Println(&channels)
	},
}

func init() {
	rootCmd.AddCommand(channelsCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// channelsCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// channelsCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
