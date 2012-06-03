/*
 * Auto Login Extension or ALEx, allows you to easily log in on websites
 * with tiresome security systems, such as banks.  
 * Copyright (C) 2012 Bruno Macherel, Pierre-Marie Dhaussy, Aurélie Gandour
 * <auto-login-extension@googlegroups.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  See LICENSE.txt or <http://www.gnu.org/licenses/  >.
 */

Logger.level = Logger.ALL;

// Add a listener on tabs for injecting scripts if needed
chrome.webNavigation.onCompleted.addListener(
	// Callback
	function(details) {
		for(var i in SCRIPTS_CONFIG) {
			var script_config = SCRIPTS_CONFIG[i];
			var config = OptionManager.getOption(script_config.id);
			if(!config) continue;
			if(!config.enabled) continue;
			var pages = script_config.pages;
			// loop on each page that can match
			for(var n in pages) {
				var page = pages[n];
				if(typeof page == "string") {
					page = page.replace(/\?/, "\\?");
					page = page.replace(/\*/, ".*");
					page = "^"+page+"$";
				}
				// Does the current URL match with this config ?
				if(details.url.match(page)) {
					//injectScripts(details, script_config, config);
					script_config.tabId = details.tabId;
					script_config.prefs = config;
					script_config.url = details.url;
					var alex = new Alex(ChromeAles, script_config);
				}
			}
		}
	},
	// Filter
	{
		urls: ["<all_urls>"],
		types: ["main_frame", "sub_frame"]
	},
	// opt_extraInfoSpec
	[]
);

