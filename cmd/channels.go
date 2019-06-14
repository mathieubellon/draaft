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
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/spf13/cobra"
)

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
		APIURL := "http://127.0.0.1:8000/public_api/pre-alpha/channels/133"
		// var netTransport = &http.Transport{
		// 	Dial: (&net.Dialer{
		// 	  Timeout: 5 * time.Second,
		// 	}).Dial,
		// 	TLSHandshakeTimeout: 5 * time.Second,
		//   }
		//   var netClient = &http.Client{
		// 	Timeout: time.Second * 10,
		// 	Transport: netTransport,
		//   }
		//   response, _ := netClient.Get(url)
		req, err := http.NewRequest(http.MethodGet, APIURL, nil)
		if err != nil {
			panic(err)
		}
		client := http.DefaultClient
		resp, err := client.Do(req)
		if err != nil {
			panic(err)
		}
		defer resp.Body.Close()
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%v", string(body))
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
