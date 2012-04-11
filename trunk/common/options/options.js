function getPanelsDescr() {
	var panelsDescr = {
		main: {
			description:'G\u00E9n\u00E9rales',
			prefs: [
				{
					description: "Mode de notification",
					options: [
						{
							id: "main.notification",
							type: "radio",
							values: [
								{ value: "desktop", label: "Sur le bureau" },
								{ value: "browser", label: "Dans le navigateur" },
								{ value: "page", label: "Uniquement sur la page du site" }
							],
							default: "desktop"
						}
					]
				}
			]
		}
	};
	for(var i=0; i<SCRIPTS_CONFIG.length; i++) {
	  var config = SCRIPTS_CONFIG[i];
	  panelDescr = {
			description: config.label,
			prefs: [
				{
					description: "Mode",
					options: [
						{
							id: config.id + ".mode",
							type: "radio",
							values: [
								{ value: 1, label: "Automatique" },
								{ value: 2, label: "Manuel" }
							],
							default: 1
						}
					]
				},
				{
					description: "Identifiant / mot de passe",
					options: [
						{id: config.id + ".credential.username", type: "text", label: "Identifiant"},
						{id: config.id + ".credential.password", type: "password", label: "Mot de passe"}
					]
				}
			]
		};
		panelsDescr[config.id] = panelDescr;
	}
	return panelsDescr;
}
function getMenusDescr() {
	var menusDescr = [];
	var mainMenu =    { id: "main", label: "G\u00E9n\u00E9rales", img:"main.png" };
	var scriptsMenu = { id: "scripts", label: "Scripts", img: "extension.png", submenu: [] };
	for(var i=0; i<SCRIPTS_CONFIG.length; i++) {
	  var config = SCRIPTS_CONFIG[i];
	  scriptsMenu.submenu.push({id: config.id, label: config.label, img: "advanced.png", checkbox: true});
	}
	menusDescr.push(mainMenu);
	menusDescr.push(scriptsMenu);
	return menusDescr;
}

var panels = getPanelsDescr();
var menus = getMenusDescr();

function switchPanel(id) {
	var tags = document.getElementsByClassName('menu-item-l1');
	for(var i=0; i<tags.length; i++) {
		var menu = tags[i];
		if(menu.id == 'menu-' + id) {
			menu.className = 'menu-item-l1 menu-enabled';
		} else {
			menu.className = 'menu-item-l1 menu-disabled';
		}
	}
	tags = document.getElementsByClassName('menu-item-l2');
	for (var i=0; i<tags.length; i++) {
		var menu = tags[i];
		if(menu.id == 'menu-' + id) {
			menu.className = 'menu-item-l2 menu-enabled';
		} else {
			menu.className = 'menu-item-l2 menu-disabled';
		}
	}
	tags = document.getElementsByClassName('panel');
	for (var i=0; i<tags.length; i++) {
		var pane = tags[i];
		if(pane.id == 'panel-' + id) {
			pane.style.display = 'block';
		} else { 
			pane.style.display = 'none';
		}
	}
	restoreOptions(id);
}

////////////////////////////////////////////////////////////////////////////////
// functions for initializing panels and menu
////////////////////////////////////////////////////////////////////////////////
function createMenuItem(parent, menuItem, level) {
  if(!level) level = 1;
	var div = document.createElement("div");
	div.setAttribute("id", "menu-"+menuItem.id);
	div.setAttribute("class", "menu-disabled menu-item-l"+level);
	var a = document.createElement("a");
	a.setAttribute("href", "javascript:switchPanel('" + menuItem.id + "')");
	var img = document.createElement("img");
	img.setAttribute("src", menuItem.img);
	a.appendChild(img);
	var span = document.createElement("span");
	var text = document.createTextNode(menuItem.label);
	span.appendChild(text);
	a.appendChild(span);
	div.appendChild(a);
	if(!!menuItem.checkbox) {
		var checkbox = document.createElement("input");
		checkbox.setAttribute("type", "checkbox");
		var checkboxId = menuItem.id + ".enabled";
		checkbox.setAttribute("name", checkboxId);
		checkbox.setAttribute("id", checkboxId);
		checkbox.setAttribute("onchange", "updateOption('"+checkboxId+"')");
		div.appendChild(checkbox);
	}
	parent.appendChild(div);
	if(!!menuItem.submenu) {
	  for(var i=0; i<menuItem.submenu.length; i++) {
	    createMenuItem(parent, menuItem.submenu[i], level + 1);
	  }
	}
	var options = {};
	var id = menuItem.id;
	var panelItem = panels[id];
	if(!!panelItem) {
		createPanel(id, panelItem);
		options[id] = getOption(id);
		if(!!options[id]) restoreOption(options, id+".enabled");
	}
}

function createPanel(id, panel) {
	var parent = document.getElementById("body");
	var panelDiv = document.createElement("div");
	panelDiv.setAttribute("id", "panel-"+id);
	panelDiv.setAttribute("class", "panel");
	var title = document.createElement("h2");
	title.appendChild(document.createTextNode(panel.description));
	panelDiv.appendChild(title);
	var element = document.createElement("div");
	element.setAttribute("class", "element");
	if(panel.prefs) {
		for(var i=0; i<panel.prefs.length; i++) {
			createPref(element, panel.prefs[i]);
		}
	}
	panelDiv.appendChild(element);
	var buttons = document.createElement("div");
	buttons.setAttribute("class", "button");
	var button = document.createElement("input");
	button.setAttribute("name", "button");
	button.setAttribute("type", "button");
	button.setAttribute("value", "Enregistrer");
	button.setAttribute("onclick", "saveOptions('"+id+"');");
	buttons.appendChild(button);
	panelDiv.appendChild(buttons);
	parent.appendChild(panelDiv);
}

function createPref(parent, prefDescr) {
	var fieldset = document.createElement("fieldset");
	var legend = document.createElement("legend");
	legend.appendChild(document.createTextNode(prefDescr.description));
	fieldset.appendChild(legend);
	for(var i=0; i<prefDescr.options.length; i++) {
		createOption(fieldset, prefDescr.options[i]);
	}
	parent.appendChild(fieldset);
}

function createOption(parent, optionDescr) {
	if(optionDescr.type=="radio") createRadio(parent, optionDescr);
	if(optionDescr.type=="checkbox") createCheckbox(parent, optionDescr);
	if(optionDescr.type=="text") createText(parent, optionDescr);
	if(optionDescr.type=="password") createPassword(parent, optionDescr);
}

function createRadio(parent, optionDescr) {
	for(var i=0; i<optionDescr.values.length; i++) {
		var radio = optionDescr.values[i];
		var input = document.createElement("input");
		input.setAttribute("type", "radio");
		input.setAttribute("name", optionDescr.id);
		var id = optionDescr.id+"."+radio.value
		input.setAttribute("id", id);
		input.setAttribute("value", radio.value);
		if(radio.value == optionDescr.default) {
			input.setAttribute("checked", "checked");
		}
		input.setAttribute("class", "left");
		parent.appendChild(input);
		var label = document.createElement("label");
		label.setAttribute("for", id);
		label.setAttribute("class", "right");
		label.appendChild(document.createTextNode(radio.label));
		parent.appendChild(label);
	}
}
function createCheckbox(parent, optionDescr) {
}
function createText(parent, optionDescr) {
	var label = document.createElement("label");
	label.setAttribute("for", optionDescr.id);
	label.setAttribute("class", "left");
	label.appendChild(document.createTextNode(optionDescr.label + " : "));
	parent.appendChild(label);
	var input = document.createElement("input");
	input.setAttribute("type", "text");
	input.setAttribute("name", optionDescr.id);
	input.setAttribute("id", optionDescr.id);
	input.setAttribute("class", "right");
	parent.appendChild(input);
}
function createPassword(parent, optionDescr) {
	var label = document.createElement("label");
	label.setAttribute("for", optionDescr.id);
	label.setAttribute("class", "left");
	label.appendChild(document.createTextNode(optionDescr.label + " : "));
	parent.appendChild(label);
	var input = document.createElement("input");
	input.setAttribute("type", "password");
	input.setAttribute("name", optionDescr.id);
	input.setAttribute("id", optionDescr.id);
	input.setAttribute("class", "right");
	parent.appendChild(input);
}

function initOptions() {
	for(var i=0; i<menus.length; i++) {
		var menu = menus[i];
		var id = menu.id;
		createMenuItem(document.getElementById("menu"), menu);
	}
	switchPanel("main");
}

////////////////////////////////////////////////////////////////////////////////
// functions for saving prefs
////////////////////////////////////////////////////////////////////////////////
function saveOptions(id) {
	for(var pannelId in panels) {
		var panel = panels[pannelId];
		if(pannelId==id) {
			var prefs = getPrefs(panel.prefs);
			fillObject(prefs, id+".enabled");
			if(!prefs) return;
			saveObject(prefs[id], id);
			return;
		}
	}
}

function saveObject(object, name) {
	setOption(name, object);
}

function getPrefs(prefs) {
    if(!prefs) return;
    var result = {};
	for(var i=0; i<prefs.length; i++) {
		var pref = prefs[i];
		for(var j=0; j<pref.options.length; j++) {
			fillObject(result, pref.options[j].id);
		}
	}
	return result;
}

function fillObject(obj, name) {
	var value = getValue(name);
	var name_parts = name.split(".");
	for(var i in name_parts) {
		name = name_parts[i];
		if(i!=name_parts.length-1) {
			if(!obj[name]) obj[name] = {};
			obj = obj[name];
		}
	}
	obj[name] = value;
}

function getValue(name) {
	var elements = document.getElementsByName(name);
	if(elements.length==0) return;
	if(elements[0].type=="radio") {
		// Find the checked value
		for(var i=0; i<elements.length; i++) {
			if(elements[i].checked) {
				return elements[i].value;
			}
		}
	} else {
		var values = [];
		for(var i=0; i<elements.length; i++) {
			if(elements[i].type=="checkbox") {
				values.push(elements[i].checked);
			} else {
				values.push(elements[i].value);
			}
		}
		if(elements.length==1) return values[0];
		else return values;
	}
}

////////////////////////////////////////////////////////////////////////////////
// functions for restoring prefs
////////////////////////////////////////////////////////////////////////////////
function restoreOptions(id) {
	var panel = panels[id];
	panel.id = id;
	var options = {};
	options[id] = getOption(id);
	if(!options[id]) return;
	restorePrefs(panel.prefs, options);
	restoreOption(options, id+".enabled");
}
function restorePrefs(prefs, options) {
	for(var i=0; i<prefs.length; i++) {
		var pref = prefs[i];
		for(var j=0; j<pref.options.length; j++) {
			restoreOption(options, pref.options[j].id);
		}
	}
}
function restoreOption(options, name) {
	// Find the value to restore
	var value = options;
	var name_parts = name.split(".");
	for(var i in name_parts) {
		value = value[name_parts[i]];
	}
	// restore the value
	restoreValue(name, value);
}
function restoreValue(name, value) {
	var elements = document.getElementsByName(name);
	if(elements.length==0) return;
	if(elements[0].type=="radio") {
		for(var i=0; i<elements.length; i++) {
			elements[i].checked = elements[i].value==value;
		}
	} else {
		var values;
		if(value instanceof Array) values = value;
		else values = [ value ];
		for(var i=0; i<elements.length; i++) {
			if(elements[i].type=="checkbox") {
				elements[i].checked=values[i];
//				for(var j=0; j<values.length; j++) {
//					elements[i].checked = elements[i].value==values[j];
//				}
			} else {
				elements[i].value=values[i];
			}
		}
	}
}

function updateOption(name) {
	var name_parts = name.split(".");
	var id = name_parts[0]
	var options = {};
	options[id] = getOption(id);
	fillObject(options, name);
	setOption(id, options[id]);
}
 
function getOption(name) {
	return eval("("+window.localStorage.getItem(name)+")");
}
function setOption(name, value) {
	window.localStorage.setItem(name, JSON.stringify(value));
}

window.addEventListener("load", initOptions, false);
