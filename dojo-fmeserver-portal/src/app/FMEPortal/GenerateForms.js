/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@version 1.0
@author Peter Jäderkvist <peter.jaderkvist@gavle.se>
@module FMEPortal/GenerateForms
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/Evented",
		"dojo/on",
		"dojo/text!./templates/workspace-form.html", // template html
		"dojo/text!./templates/result.html",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/dom",
		"dojo/topic",
		"dijit/registry",

		"dojo/data/ObjectStore",
		"dojo/store/Memory",

		"./Utils",

		"dojo/i18n!./nls/resources",

		"./FileUpload",
		"dijit/form/TextBox",
		"dijit/form/Select",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/CheckBox",
		"dijit/form/NumberTextBox",
		"dijit/form/ValidationTextBox",
		"dijit/form/Textarea",
		"dojox/form/CheckedMultiSelect",
		"dijit/form/DropDownButton",
		"esri/dijit/ColorPicker",
		"esri/Color"

	],
	function (
		declare,
		lang,
		array,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		on,

		dijitTemplate, resultTemplate,

		domStyle, domConstruct, dom, topic, registry,
		ObjectStore, Memory, Utils,

		resourceStrings,

		FileUpload, TextBox, Select, Form, Button, CheckBox, NumberTextBox,
		ValidationTextBox, Textarea, MultiSelect, DropDownButton,
		ColorPicker, Color) {
	var Widget = declare("FmePortal-GenerateForms", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

			templateString : dijitTemplate,
			widgetsInTemplate : true,

			constructor : function (args) {

				this.options = lang.mixin({}, this.options, args.options);
				this.nls = resourceStrings;

				this._parameters = args.parameters;
				this._repository = args.ws.repo;
				this._workspace = args.ws.id;
				this._type = args.ws.service;
				this._startGeometry = args.geometry || null;
				this._label = args.ws.label;

				if (args.ws &&
					args.ws.description &&
					args.ws.label) {
					this.title = args.ws.label + " <i class='material-icons'>&#xE887;</i>";
					this.description = args.ws.description;
				} else {
					this.title = args.ws.id;
					this.description = null;
				}

				this._addTopics();

			},
			/**
			 * Subscriptions
			 * "modules/FmePortalen/disableOrderButton"
			 * "modules/FmePortalen/enableOrderButton"
			 * "modules/FmePortalen/orderStart"
			 * "modules/FmePortalen/orderComplete"
			 *
			 * @private
			 */
			_addTopics : function () {

				this.own(
					topic.subscribe("FMEPortal/disableOrderButton", lang.hitch(this, function () {
							if (this._order) {
								this._order.set("disabled", true);
							}
						})),
					topic.subscribe("FMEPortal/enableOrderButton", lang.hitch(this, function () {
							if (this._order) {
								this._order.set("disabled", false);
							}
						})),
					// Disable order button on start
					topic.subscribe("FMEPortal/orderStart", lang.hitch(this, function () {
							if (this._order) {
								this._order.set("disabled", true);
							}
						})),
					// Enable order button on completion
					topic.subscribe("FMEPortal/orderComplete", lang.hitch(this, function () {
							if (this._order) {
								this._order.set("disabled", false);
							}
						})));

			},

			/**
			 * Create dijit forms based on FME parameter types
			 * NOVALUE - dijit/form/TextBox
			 * LOOKUP_CHOICE - dijit/form/Select
			 * CHOICE - dijit/form/CheckBox
			 * TEXT - dijit/form/TextBox
			 * PASSWORD - dijit/form/ValidationTextBox
			 * FLOAT - dijit/form/NumberTextBox
			 * INTEGER - dijit/form/NumberTextBox
			 * RANGE_SLIDER - dijit/form/NumberTextBox
			 * FILE_OR_URL - FmePortal/FileUpload
			 * MULTIFILE - FmePortal/FileUpload
			 * FILENAME_MUSTEXIST - dijit/form/TextBox
			 * FILENAME - dijit/form/TextBox
			 * TEXT_EDIT - dijit/form/TextBox
			 * LOOKUP_LISTBOX - dijit/form/CheckedMultiSelect
			 * LISTBOX - dijit/form/CheckedMultiSelect
			 * COLOR_PICK - dijit/form/DropDownButton, esri/dijit/ColorPicker
			 */
			postCreate : function () {
				this.inherited(arguments);

				this._activeFileUploads = []; // Support multiple file uploads

				array.forEach(this._parameters, lang.hitch(this, function (param) {

						var hiddenForms = [this.options.settings.fme.geometry.parameter]; // Hide geometry field
						if (!this.options.settings.adminMode) { // If admin mode, show FME_SERVER_DEST_DIR parameter
							hiddenForms.push("FME_SERVER_DEST_DIR");
						}

						var hidden = hiddenForms.indexOf(param.name) !== -1;

						switch (param.type) {
						case "NOVALUE":
							this._generateTextBox(param, hidden);
							break;
						case "LOOKUP_CHOICE":
							this._generateSelect(param, hidden);
							break;
						case "CHOICE":
							this._generateCheckBox(param, hidden);
							break;
						case "TEXT":
							this._generateTextBox(param, hidden);
							break;
						case "PASSWORD":
							this._generatePasswordTextBox(param, hidden);
							break;
						case "FLOAT":
							this._generateNumberTextBox(param, hidden, "float");
							break;
						case "INTEGER":
							this._generateNumberTextBox(param, hidden, "integer");
							break;
						case "RANGE_SLIDER":
							this._generateNumberTextBox(param, hidden, "minmax");
							break;
						case "FILE_OR_URL":
							this._generateUpload(param, hidden);
							break;
						case "MULTIFILE":
							this._generateUpload(param, hidden);
							break;
						case "FILENAME_MUSTEXIST":
							this._generateTextBox(param, hidden, true);
							break;
						case "FILENAME":
							this._generateTextBox(param, hidden, true);
							break;
						case "TEXT_EDIT":
							this._generateTextarea(param, hidden);
							break;
						case "LOOKUP_LISTBOX":
							this._generateMultiSelect(param, hidden);
							break;
						case "LISTBOX":
							this._generateMultiSelect(param, hidden);
							break;
						case "COLOR_PICK":
							this._generateColorPicker(param, hidden);
							break;
						default:
							this._generateTextBox(param, hidden);
						}

					}));

				this.own(
					on(this._order, 'click', lang.hitch(this, this._runOrder)));

				// Click event to toggle description-section
				if (this.title && this.description) {
					Utils.show(this._title);
					this.own(
						on(this._title, "click", lang.hitch(this, function () {
								Utils.toggle(this._description);
							})));
				}

			},

			/**
			 * Add a select option for each supported service type
			 */
			addServiceSelect : function (details) {
				var list = [];
				array.forEach(details.services, function (service) {
					var item = {
						"label" : service.displayName,
						"value" : service.name
					};
					list.push(item);
				});

				Utils.show(this._serviceType);
				this._serviceSelect = new Select({
						id : "fmeportal-service-select",
						name : "service",
						options : list,
						style : "width:185px"
					}, this._serviceType).startup();
			},

			/**
			 * Update geometry value
			 */
			setGeometry : function (jsonGeom) {
				if (this._geometryBox && jsonGeom && jsonGeom.length > 0) {
					this._geometryBox.set('value', jsonGeom);
				} else if (this._geometryBox) {
					this._geometryBox.set('value', "");
				}
			},

			_runOrder : function () {

				if (this._form.validate()) {

					topic.publish("FMEPortal/orderStart");

					var values = this._form.get("value");
					var params = this._processValuesToString(values);
					var paramsObj = this._processValuesToObject(values);

					// Set service type
					if (registry.byId("fmeportal-service-select")) {
						this._type = registry.byId("fmeportal-service-select").get('value');
					}

					// Validate and collect uploaded files from widgets
					if (this._activeFileUploads && this._activeFileUploads.length > 0) {

						params = {
							paramnames : [],
							files : [],
							params : params,
							service : this._type
						};

						var paths = [];

						// Multiple file upload forms
						array.forEach(this._activeFileUploads, lang.hitch(this, function (fileUpload) {

								var filesResources = fileUpload.getValues();

								// Push uploaded files to the params.files array
								if (filesResources && filesResources.files) {
									params.paramnames.push(fileUpload.get("paramname"));
									params.files.push(filesResources.files);
									paths.push(fileUpload.get("path"));
								}

							}));

						switch (this._type) {
						case "fmedatadownload":
							FMEServer.runWorkspaceWithData(this._repository, this._workspace, paths, params, lang.hitch(this, this._resultDataDownload));
							break;
						case "fmejobsubmitter":
							FMEServer.runWorkspaceWithData(this._repository, this._workspace, paths, params, lang.hitch(this, this._resultJobSubmitter));
							break;
						case "fmedatastreaming":
							FMEServer.runWorkspaceWithData(this._repository, this._workspace, paths, params, lang.hitch(this, this._resultDataStreaming));
							break;
						default:
							resultObject = {
								"resultClass" : "error",
								"date" : this.nls.GenerateForms.Error["No transformation result"],
								"message" : lang.replace(this.nls.GenerateForms.Error.ServiceType, {
									"type" : this._type
								}),
								"workspace" : this._label || this._workspace,
								"icon" : "&#xE86C;"
							};
							topic.publish("FMEPortal/orderComplete", domConstruct.toDom(lang.replace(resultTemplate, resultObject)));
						}
						return;
					}

					var resultObject;
					// Run workspace (no file uploads)
					switch (this._type) {
					case "fmedatadownload":
						FMEServer.runDataDownload(this._repository, this._workspace, params, lang.hitch(this, this._resultDataDownload));
						break;
					case "fmejobsubmitter":
						FMEServer.submitSyncJob(this._repository, this._workspace, paramsObj, lang.hitch(this, this._resultJobSubmitter));
						break;
					case "fmedatastreaming":
						FMEServer.runDataStreaming(this._repository, this._workspace, params, lang.hitch(this, this._resultDataStreaming));
						break;
					default:
						resultObject = {
							"resultClass" : "error",
							"date" : this.nls.GenerateForms.Error["No transformation result"],
							"message" : lang.replace(this.nls.GenerateForms.Error.ServiceType, {
								"type" : this._type
							}),
							"workspace" : this._label || this._workspace,
							"icon" : "&#xE86C;"
						};
						topic.publish("FMEPortal/orderComplete", domConstruct.toDom(lang.replace(resultTemplate, resultObject)));
					}
				}

			},

			/**
			 *  Handle datadownload-results
			 */
			_resultDataDownload : function (json) {

				var resultObject = {
					"resultClass" : "success",
					"date" : null,
					"message" : null,
					"workspace" : this._label || this._workspace,
					"icon" : "&#xE86C;"
				};

				// Translation OK
				if (json && json.serviceResponse && json.serviceResponse.statusInfo && json.serviceResponse.statusInfo.status === "success") {

					resultObject.date = json.serviceResponse.fmeTransformationResult.fmeServerResponse.timeFinished;
					if (json.serviceResponse.url) { // Download link
						resultObject.message = "<i class='material-icons'>&#xE2C4;</i><a href='" + json.serviceResponse.url + "'>" + this.nls.GenerateForms.Results.Download + "</a>";
					} else { // Features output Message
						resultObject.message = this._checkSuccessMessage(json.statusMessage) + ", " + json.numFeaturesOutput + " " + this.nls.GenerateForms.Results.Count;
					}

				} else { // Something went wrong
					resultObject.resultClass = "error"; // Update css class
					resultObject.date = json.serviceResponse.fmeTransformationResult ? json.serviceResponse.fmeTransformationResult.fmeServerResponse.timeFinished : this.nls.GenerateForms.Error["No transformation result"];
					resultObject.message = this._checkErrorMessage(json.serviceResponse.statusInfo.message); // Update error message
					resultObject.icon = "&#xE000;"; // Update icon
				}

				// Show results
				topic.publish("FMEPortal/orderComplete", domConstruct.toDom(lang.replace(resultTemplate, resultObject)), json);

			},

			/**
			 *  Handle jobsubmitter-results
			 */
			_resultJobSubmitter : function (json) {

				var resultObject = {
					"resultClass" : "success",
					"date" : null,
					"message" : null,
					"workspace" : this._label || this._workspace,
					"icon" : "&#xE86C;"
				};

				if (json && json.serviceResponse &&
					json.serviceResponse.statusInfo &&
					json.serviceResponse.statusInfo &&
					json.serviceResponse.statusInfo.status === "success") {

					var fmeEngineResponse = json.serviceResponse.fmeTransformationResult.fmeEngineResponse;
					resultObject.date = json.serviceResponse.fmeTransformationResult.fmeServerResponse.timeFinished;
					resultObject.message = this._checkSuccessMessage(fmeEngineResponse.statusMessage) + ", " + fmeEngineResponse.numFeaturesOutput + " " + this.nls.GenerateForms.Results.Count;

				} else if (json && json.status === "SUCCESS") {
					resultObject.date = json.timeFinished;
					resultObject.message = this._checkSuccessMessage(json.statusMessage) + ", " + json.numFeaturesOutput + " " + this.nls.GenerateForms.Results.Count;
				} else { // Something went wrong
					resultObject.resultClass = "error"; // Update css class

					if (json.timeFinished) {
						resultObject.date = json.timeFinished ? json.timeFinished : this.nls.GenerateForms.Error["No transformation result"];
						resultObject.message = this._checkErrorMessage(json.statusMessage || json.serviceResponse.statusInfo.message); // Update error message
					} else {
						resultObject.date = json.serviceResponse.fmeTransformationResult ? json.serviceResponse.fmeTransformationResult.fmeServerResponse.timeFinished : this.nls.GenerateForms.Error["No transformation result"];
						resultObject.message = this._checkErrorMessage(json.serviceResponse.statusInfo.message); // Update error message
					}
					resultObject.icon = "&#xE000;"; // Update icon
				}

				// Show results
				topic.publish("FMEPortal/orderComplete", domConstruct.toDom(lang.replace(resultTemplate, resultObject)), json);

			},

			/**
			 *  Handle datastreaming-results
			 */
			_streamingCount : 0,
			_resultDataStreaming : function (result) {

				var resultObject = {
					"resultClass" : "success",
					"date" : null,
					"message" : null,
					"workspace" : this._label || this._workspace,
					"icon" : "&#xE86C;"
				};

				if (result) {
					if (typeof result === 'object') {
						result = "<pre style='width:600px;'>" + JSON.stringify(result, null, 4) + "</pre>";
					} else {
						result = "<pre style='width:600px;'>" + this._escapeHTML(result) + "</pre>";
					}

					this._streamingCount = this._streamingCount + 1;
					resultObject.date = new Date().toISOString();
					resultObject.message = this.nls.GenerateForms.Results["Success"] + " <a style='cursor:pointer;' id='" + this.id + "-streaming-" + this._streamingCount + "'><i class='material-icons'>&#xE8F4;</i> " + this.nls.GenerateForms.Results["ViewStreamingResult"] + "</a>";

				} else {
					resultObject.resultClass = "error";
					resultObject.message = this.nls.GenerateForms.Error["No output dataset"];
					resultObject.icon = "&#xE000;"; // Update icon
				}

				// Show results
				topic.publish("FMEPortal/orderComplete", domConstruct.toDom(lang.replace(resultTemplate, resultObject)));

				if (result) {
					on(dom.byId(this.id + "-streaming-" + this._streamingCount), 'click', function () {
						topic.publish("FMEPortal/alert", "FME-portal Data Streaming", result);
					});
				}

			},

			_escapeHTML : function (html) {
				return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			},

			_checkErrorMessage : function (message) {

				if (message) {

					var errorMsg = message;

					if (this._isNumber(message.slice(-5, -2)) && this.options.settings.fme.customErrors) { //Check error codes from terminators, map error messages in "customErrors"
						errorMsg = this.options.settings.fme.customErrors[message.slice(-5, -2)] || this.nls.GenerateForms.Error.Unknown;
					} else {

						// Common errors
						errorMsg = errorMsg.contains("No output dataset was produced by FME transformation") ? this.nls.GenerateForms.Error["No output dataset"] : errorMsg;
						errorMsg = errorMsg.contains("A fatal error has occurred") ? this.nls.GenerateForms.Error["Fatal error"] : errorMsg;
						errorMsg = errorMsg.contains("Parameter '" + this.options.settings.fme.geometry.parameter + "' must be given a value.") ? this.nls.GenerateForms.Error["Missing geometry"] : errorMsg;
						errorMsg = errorMsg.contains("FME Server transformation failed: ") ? errorMsg.replace("FME Server transformation failed: ", "") : errorMsg;
						errorMsg = errorMsg.contains("Unauthorized request") ? this.nls.GenerateForms.Error["Unauthorized request"] : errorMsg;

						if (errorMsg.contains("Authentication failed")) { // Login problem, session expired? Show login
							topic.publish("FMEPortal/showLogin");
						}
					}

					return errorMsg;
				}

			},

			_checkSuccessMessage : function (message) {
				if (message) {
					var successMsg = message;
					successMsg = successMsg.contains("Translation Successful") ? this.nls.GenerateForms.Results["Success"] : successMsg;
					return successMsg;
				}
			},

			_isNumber : function (n) {
				return !isNaN(parseFloat(n)) && isFinite(n);
			},

			/**
			 * Create url parameter string. Ex asdf=dsf&sdfg=asdf
			 */
			_processValuesToString : function (values) {

				var params = "",
				val,
				isCheckbox,
				isEditText,
				children,
				key;

				for (key in values) {
					if (values.hasOwnProperty(key)) {
						val = values[key];

						if (typeof val === 'string') {
							isEditText = false;
							children = this._form.getChildren();
							array.forEach(children, function (child) {
								if (child.name === key && child.isEditText) {
									isEditText = true;
								}
							});
							if (isEditText) { // Multiline text to XML
								params += key + "=" + encodeURIComponent(this._convertMultilineText(key, val)) + "&";
							} else {
								params += key + "=" + encodeURIComponent(val) + "&";
							}

						} else if (typeof val === 'number') {
							if (!isNaN(val)) {
								params += key + "=" + val + "&";
							}
						} else {

							// Find checkboxes
							isCheckbox = false;
							children = this._form.getChildren();
							array.forEach(children, function (child) {
								if (child.name === key && child.isCheckbox) {
									isCheckbox = true;
								}
							});

							if (isCheckbox) { // Checkbox to Yes/No
								params += val.length === 0 ? key + "=No&" : key + "=Yes&";
							} else { // Listboxes
								params += key + "=" + encodeURIComponent(val.toString()) + "&";
							}

						}
					}
				}

				return params;
			},

			/**
			 * Put parameters in publishParameters array, required by jobsubmitter sync jobs.
			 */
			_processValuesToObject : function (values) {

				var params = {
					"publishedParameters" : []
				},
				val,
				key,
				isCheckbox,
				children,
				isEditText;

				for (key in values) {
					if (values.hasOwnProperty(key)) {
						val = values[key];
						if (typeof val === 'string') {
							isEditText = false;
							children = this._form.getChildren();
							array.forEach(children, function (child) {
								if (child.name === key && child.isEditText) {
									isEditText = true;
								}
							});
							if (isEditText) { // Multiline text to XML
								params.publishedParameters.push({
									"name" : key,
									"value" : this._convertMultilineText(key, val)
								});
							} else {
								params.publishedParameters.push({
									"name" : key,
									"value" : val
								});
							}
						} else if (typeof val === 'number') {
							if (!isNaN(val)) {
								params.publishedParameters.push({
									"name" : key,
									"value" : val
								});
							}
						} else {

							// find checkboxes
							isCheckbox = false;
							children = this._form.getChildren();
							array.forEach(children, function (child) {
								if (child.name === key && child.isCheckbox) {
									isCheckbox = true;
								}
							});

							if (isCheckbox) { // Checkbox to Yes/No
								params.publishedParameters.push({
									"name" : key,
									"value" : val.length === 0 ? "No" : "Yes"
								});
							} else { // Listboxes
								params.publishedParameters.push({
									"name" : key,
									"value" : val
								});
							}
						}

					}
				}

				return params;

			},
			_generateSelect : function (param, hidden) {
				console.log(param);
				var list = [];
				array.forEach(param.listOptions, function (p) {
					var item = {
						"label" : p.caption,
						"value" : p.value
					};
					if (item.value === param.defaultValue) {
						console.info("SELECT" + item.value + " " + param.defaultValue);
						item.selected = true;
					}
					list.push(item);
				});

				var container = this._generateContainer(param, hidden);

				var select = new Select({
						name : param.name,
						options : list,
						style : "width:185px"
					}).placeAt(container, "last").startup();

			},

			_generateCheckBox : function (param, hidden) {

				if (param.defaultValue === "Yes" || param.defaultValue === "No") {

					var container = this._generateContainer(param, hidden);
					var checkbox = new CheckBox({
							name : param.name,
							checked : param.defaultValue === "Yes"
						}).placeAt(container, "last");

					checkbox.startup();

					checkbox.set("isCheckbox", true);

				}

			},

			_generateTextBox : function (param, hidden, disabled) {

				var container = this._generateContainer(param, hidden);

				var textbox;

				// Geometry input
				if (param.name === this.options.settings.fme.geometry.parameter) {
					textbox = new TextBox({
							name : param.name,
							value : this._startGeometry || "",
							style : "width:185px"
						});
					this._geometryBox = textbox;

					topic.publish("FMEPortal/showGeometryTools");
					// Notify Toolbar, the workspace have geometry parameter

				} else {
					textbox = new TextBox({
							name : param.name,
							value : param.defaultValue,
							style : "width:185px"
						});
				}

				textbox.placeAt(container, "last");

				if (disabled) {
					textbox.set('disabled', true);
				}

			},

			_generateTextarea : function (param, hidden) {

				// If type == geometry, use normal textbox
				if (param.name === this.options.settings.fme.geometry.parameter) {
					this._generateTextBox(param, hidden);
					return;
				}

				var container = this._generateContainer(param, hidden);

				var value = this._convertMultilineText(null, param.defaultValue, true);

				var textbox = new Textarea({
						name : param.name,
						value : value,
						style : "width:185px"
					});

				textbox.startup();
				textbox.set("isEditText", true);
				textbox.placeAt(container, "last");

			},

			_generatePasswordTextBox : function (param, hidden) {

				var container = this._generateContainer(param, hidden);

				var textbox = new ValidationTextBox({
						type : "password",
						name : param.name,
						value : param.defaultValue,
						style : "width:185px"
					});

				textbox.placeAt(container, "last");

			},

			_generateNumberTextBox : function (param, hidden, type) {

				var container = this._generateContainer(param, hidden);

				var configs = {
					name : param.name,
					value : Number(param.defaultValue),
					style : "width:185px"
				};

				if (type === "integer") {
					configs.constraints = {
						places : 0
					};
					configs.invalidMessage = this.nls.GenerateForms.NumberTextBox.IntegerMessage;
				}

				if (type === "float") {
					configs.invalidMessage = this.nls.GenerateForms.NumberTextBox.NumberMessage;
				}

				if (type === "minmax") {
					configs.constraints = {
						min : param.minimum,
						max : param.maximum
					};
					configs.invalidMessage = lang.replace(this.nls.GenerateForms.NumberTextBox.MinMaxMessage, {
							"min" : param.minimum,
							"max" : param.maximum
						});
					configs.placeholder = lang.replace(this.nls.GenerateForms.NumberTextBox.MinMaxPlaceholder, {
							"min" : param.minimum,
							"max" : param.maximum
						});
				}

				var textbox = new NumberTextBox(configs);

				textbox.placeAt(container, "last");

			},

			_generateMultiSelect : function (param, hidden) {

				var container = this._generateContainer(param, hidden);

				var data = [];

				array.forEach(param.listOptions, function (p) {
					data.push({
						id : p.value,
						label : p.caption
					});
				});

				var wsOs = new ObjectStore({
						objectStore : new Memory({
							data : data
						})
					});

				var multiSelect = new MultiSelect({
						name : param.name,
						store : wsOs,
						style : "width:185px;border:0;",
						multiple : true
					}).placeAt(container, "last");

				multiSelect.set('value', param.defaultValue);

			},

			_generateColorPicker : function (param, hidden) {

				var container = this._generateContainer(param, hidden);

				var rgb = param.defaultValue.split(",");
				var startColor;

				if (rgb.length === 3) {
					startColor = new Color([
								parseInt(rgb[0] * 255),
								parseInt(rgb[1] * 255),
								parseInt(rgb[2] * 255)
							]);
					domStyle.set(container, 'background', 'rgb(' + startColor.r + "," + startColor.g + "," + startColor.b + ")");
				}

				var cp = new ColorPicker({
						color : startColor || new Color([255, 255, 255]),
						showTransparencySlider : false,
						showRecentColors : false,
						required : false
					});

				var dropdownbutton = new DropDownButton({
						label : this.nls.GenerateForms.ColorPicker.SelectColor,
						style : "width:185px",
						dropDown : cp
					}).placeAt(container, "last").startup();

				var textbox = new TextBox({
						name : param.name,
						value : param.defaultValue,
						style : "display:none;"
					}).placeAt(container, "last");

				cp.on('color-change', function (color) {
					domStyle.set(container, 'background', 'rgb(' + cp.color.r + "," + cp.color.g + "," + cp.color.b + ")");
					textbox.set('value', (cp.color.r / 255).toFixed(3) + "," + (cp.color.g / 255).toFixed(3) + "," + (cp.color.b / 255).toFixed(3));
				});

			},

			_generateContainer : function (param, hidden, hideCaption) {

				var li = domConstruct.create("li", {
						"class" : "fmeportal-formitem"
					});

				var caption = domConstruct.create("div", {
						"class" : "fmeportal-caption",
						"innerHTML" : param.description
					});

				var element = domConstruct.create("div", {
						"class" : "fmeportal-element"
					});

				domConstruct.place(li, this._formList, "last");

				if (hidden) {
					Utils.hide(li);
				}

				if (hideCaption) {
					return li;
				}

				domConstruct.place(caption, li, "last");
				domConstruct.place(element, li, "last");

				return element;
			},

			_generateUpload : function (param, hidden) {

				var container = this._generateContainer(param, hidden, true);

				var fileUpload = new FileUpload({
						settings : this.options.settings,
						repository : this._repository,
						workspace : this._workspace,
						parameter : {
							name : param.name,
							description : param.description
						}
					});

				this._activeFileUploads.push(fileUpload);

				fileUpload.placeAt(container, "last");
			},

			_convertMultilineText : function (parameter, text, fromXml) {

				// Skip geometry
				if (parameter === this.options.settings.fme.geometry.parameter) {
					return text;
				}

				var converted = "";
				if (fromXml) {
					converted = text ? text.
						replaceAll("<space>", " ").
						replaceAll("<lf>", "\n").
						replaceAll("<u00e5>", "å").
						replaceAll("<u00f6>", "ö").
						replaceAll("<u00e4>", "ä").
						replaceAll("<u00c5>", "Å").
						replaceAll("<u00c4>", "Ä").
						replaceAll("<u00d6>", "Ö") : "";
				} else {
					converted = text ? text.
						replaceAll(" ", "<space>").
						replaceAll("\n", "<lf>").
						replaceAll("å", "<u00e5>").
						replaceAll("ö", "<u00f6>").
						replaceAll("ä", "<u00e4>").
						replaceAll("Å", "<u00c5>").
						replaceAll("Ä", "<u00c4>").
						replaceAll("Ö", "<u00d6>") : "";
				}

				return converted;
			}

		});
	return Widget;
});
