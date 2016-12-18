/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@version 1.0
@author Peter Jäderkvist <peter.jaderkvist@gavle.se>
@module FMEPortal
@license See https://github.com/gavlepeter/dojo-fmeserver-portal/blob/master/License.md
 */
define([
		"require",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/Evented",
		"dojo/on",
		"dojo/Deferred",
		"dojo/promise/all",
		"dojo/text!./FMEPortal/templates/wrapper.html",
		"dojo/dom-construct",
		"dojo/topic",
		"dojo/Stateful",

		"dijit/registry",
		"dijit/form/Select",
		"dijit/form/Button",
		"dijit/Dialog",
		"dojo/data/ObjectStore",
		"dojo/store/Memory",

		"./FMEPortal/Utils",
		"./FMEPortal/Login",
		"./FMEPortal/WorkspaceInfo",
		"./FMEPortal/GenerateForms",
		"./FMEPortal/Status",

		"dojo/i18n!./FMEPortal/nls/resources",
		"xstyle/css!./FMEPortal/css/styles.css"
	],
	function (
		require,
		declare,
		lang,
		array,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		on,
		Deferred, all,
		dijitTemplate,
		domConstruct, topic, Stateful,
		registry, Select, Button, Dialog, ObjectStore, Memory, Utils,

		Login, WorkspaceInfo, GenerateFmeForm, Status,

		resourceStrings) {
	var Widget = declare("FmePortal-Widget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, Stateful], {

			// template HTML
			templateString : dijitTemplate,
			widgetsInTemplate : true,

			baseClass : "fmeportal",

			_eventHandles : [],
			_resultCount : 0,

			constructor : function (options) {

				this.options = options;
				this.nls = resourceStrings;
				this.loaderAnim = require.toUrl("./FMEPortal/images/loader.gif");

				String.prototype.replaceAll = function (search, replacement) {
					var target = this;
					return target.replace(new RegExp(search, 'g'), replacement);
				};
				String.prototype.contains = function (it) {
					return this.indexOf(it) != -1;
				};

				this._addTopics();

			},

			_addTopics : function () {

				topic.subscribe("FMEPortal/orderStart", lang.hitch(this, function (html) {
						Utils.show(this._resultLoading);
					}));

				topic.subscribe("FMEPortal/orderComplete", lang.hitch(this, function (node) {
						Utils.hide(this._resultLoading);
						this.set("_resultCount", this.get("_resultCount") + 1);
						domConstruct.place(node, this._resultView, "first");
					}));

				topic.subscribe("FMEPortal/showLogin", lang.hitch(this, function () {
						topic.publish("FMEPortal/alert", this.options.settings.fme.general.title, this.nls.Login.Messages.Expired);
						Utils.hide(this._loadingParams);
						this._resultView.innerHTML = "";
						this._removeExistingToken();
						this._logoutButton.destroy();
						this._loginStatus.innerHTML = "";
						this._showLogin();
					}));

				topic.subscribe("FMEPortal/alert", lang.hitch(this, function (title, content) {
						var myDialog = new Dialog({
								title : title,
								content : content,
								autofocus : false,
								hide : function () {
									myDialog.destroy();
								}
							});
						myDialog.show();
					}));

			},

			postCreate : function () {
				this.inherited(arguments);

				// Lookup existing token from LocalStorage.
				var savedSettings = this._getExistingToken();
				if (savedSettings && savedSettings.token && savedSettings.server) {

					this.options.settings.fme.server.adminMode = savedSettings.adminMode;
					this.options.settings.fme.server.url = savedSettings.server;

					// Init FMEServer using saved token and serverinfo
					FMEServer.init({
						server : this.options.settings.fme.server.url,
						token : savedSettings.token
					});

					// Verify token validity and start the FmePortal or Show login
					this._testExistingToken().then(lang.hitch(this, function (loginSuccess) {
							if (loginSuccess) {
								this._updateLoginStatus(savedSettings.username);
								this._startFmePortal(this.options.settings.fme.server.adminMode);
							} else {
								this._showLogin();
							}
						}));

				} else {
					if (this.options.settings.fme.server.token.autoLogin) { // Sign in using token from config
						FMEServer.init({
							server : this.options.settings.fme.server.url,
							token : this.options.settings.fme.server.token.token || "12345"
						});

						// Verify token validity and start the FmePortal or Show login
						this._testExistingToken().then(lang.hitch(this, function (loginSuccess) {
								if (loginSuccess) {
									this._startFmePortal(this.options.settings.fme.server.adminMode);
								} else {
									this._showLogin();
								}
							}));
					} else {

						// No saved token and no autoLogin
						FMEServer.init({
							server : this.options.settings.fme.server.url,
							token : "111"
						});
						this._showLogin();
					}
				}

				// Watch result-count, toggle Clear-button
				this.watch("_resultCount", lang.hitch(this, function (name, oldValue, value) {
						if (value > 0) {
							Utils.show(this._resetResultCount);
							Utils.hide(this._noResults);
						} else {
							Utils.hide(this._resetResultCount);
							Utils.show(this._noResults);
						}
					}));

				this.own(
					// Click to clear results
					on(this._resetResultCount, 'click', lang.hitch(this, function () {
							this.set("_resultCount", 0);
							this._resultView.innerHTML = "";
						})),
					// Show About
					on(this._about, 'click', lang.hitch(this, function () {
							topic.publish("FMEPortal/alert", this.nls.Widget.About + " " + this.options.settings.fme.general.title, this.options.settings.fme.general.about);
						})));

			},

			_showLogin : function () {

				var login = new Login(this.options).placeAt(this._loginWrapper, "first");
				login.startup();

				// Normal sign in with username and password
				login.on("login", lang.hitch(this, function (evt, settings) {
						lang.mixin(this.options.settings.fme.server, settings);

						FMEServer.init({
							server : this.options.settings.fme.server.url,
							token : "111"
						});

						FMEServer.generateToken(
							encodeURIComponent(evt.username),
							encodeURIComponent(evt.password),
							this.options.settings.fme.server.token.time,
							this.options.settings.fme.server.token.unit,
							lang.hitch(this, function (token) {
								console.log("login-callback", arguments);
								if (token.contains("Authentication failed")) {
									login.setLoginStatus(this.nls.Login.Messages.BadLogin);
								} else if (token === "") {
									login.setLoginStatus(lang.replace(this.nls.Login.Messages.NoAccess, {
											"url" : this.options.settings.fme.server.url
										}));
								} else if (token.contains("Both user ID and password need to be specified")) {
									login.setLoginStatus(this.nls.Login.Messages.BadLogin);
								} else {
									login.destroy();

									this._updateLoginStatus(evt.username);
									FMEServer.init({
										server : this.options.settings.fme.server.url,
										token : token
									});

									this._saveToken(token, evt.username);
									this._startFmePortal(this.options.settings.fme.server.adminMode);
								}
							}));
					}));

				// Token sign in
				login.on("tokenLogin", lang.hitch(this, function (evt, settings) {
						lang.mixin(this.options.settings.fme.server, settings);

						FMEServer.init({
							server : this.options.settings.fme.server.url,
							token : evt.token
						});

						this._testExistingToken().then(lang.hitch(this, function (loginSuccess) {
								if (loginSuccess) {
									login.destroy();
									this._updateLoginStatus();
									this._saveToken(evt.token, "token-user");
									this._startFmePortal(this.options.settings.fme.server.adminMode);
								} else {
									login.setTokenStatus(this.nls.Login.Messages.BadToken);
								}
							}));
					}));
			},

			_updateLoginStatus : function (username) {

				// Normal user sign in
				if (username) {
					this._loginStatus.innerHTML = this.nls.Login.SignedInAs + " <b>" + username + "</b>. ";
				} else { // Token sign in
					this._loginStatus.innerHTML = this.nls.Login.TokenSignIn + ". ";
				}

				// Add sign out button
				this._logoutButton = new Button({
						"label" : this.nls.Login.ButtonSignout,
						"onClick" : lang.hitch(this, function () {
							this._removeExistingToken();
							this._logoutButton.destroy();
							this._loginStatus.innerHTML = "";
							this._showLogin();
						})
					}).placeAt(this._loginStatus, "last");

			},

			_saveToken : function (token, username) {
				// Save token, username, server and mode to localStorage
				localStorage.setItem('fmeportal-' + this.options.settings.fme.general.id + '-token', JSON.stringify({
						token : token,
						username : username,
						server : this.options.settings.fme.server.url,
						adminMode : this.options.settings.fme.server.adminMode
					}));
			},

			_getExistingToken : function () {

				var token = localStorage.getItem('fmeportal-' + this.options.settings.fme.general.id + '-token');
				try {
					if (token) {
						return JSON.parse(token);
					} else {
						return null;
					}

				} catch (e) {
					return null;
				}
			},

			_removeExistingToken : function () {

				FMEServer.init({
					server : this.options.settings.fme.server.url,
					token : "12345"
				});

				// Hide UI
				array.forEach([
						this._stepOne,
						this._stepTwo,
						this._stepThree,
						this._workspaceSelector,
						this._repositorySelector
					], function (node) {
					Utils.hide(node);
				});

				// Remove selects and forms
				this._rsSelect ? this._rsSelect.destroy() : null;
				this._wsSelect ? this._wsSelect.destroy() : null;
				this._activeForm ? this._activeForm.destroy() : null;

				// Clear saved token
				localStorage.removeItem('fmeportal-' + this.options.settings.fme.general.id + '-token');

			},

			_testExistingToken : function () {
				var deferred = new Deferred();
				FMEServer.getResources(lang.hitch(this, function (evt) {
						if ((evt && evt.message && evt.message.contains("Authentication failed")) || evt === "") {
							deferred.resolve(false);
						} else {
							deferred.resolve(true);
						}
					}));
				return deferred;
			},

			_startFmePortal : function (adminMode) {

				// Remove existing WorkspaceInfo button
				if (registry.byId("fmeportal-details")) {
					registry.byId("fmeportal-details").destroy();
				}

				// Show UI
				array.forEach([
						this._stepOne,
						this._stepTwo,
						this._stepThree
					], function (node) {
					Utils.show(node);
				});

				// Conditionally load the map Toolbar module
				if (this.options.map) {
					require(["./FMEPortal/Toolbar"], lang.hitch(this, function (Toolbar) {
							// Init Geometry Toolbar
							if (this._activeToolbar) {
								this._activeToolbar.destroy();
							}
							this._activeToolbar = new Toolbar(this.options).placeAt(this._toolbar);

							// On Toolbar draw-end, set geometry in the active form
							this.own(
								on(this._activeToolbar, 'geometry-change', lang.hitch(this, function (jsonGeom) {
										if (this._activeForm) {
											this._activeForm.setGeometry(jsonGeom);
										}
									})));
						}));
				} else {
					this._toolbar.innerHTML = this.nls.Toolbar.NoMap;
				}

				// Remove old event handles
				array.forEach(this._eventHandles, function (handle) {
					handle.remove();
				});

				// Get all repositorys for the authenticated user if adminMode = true
				if (adminMode) {
					Utils.show(this._loadingContent);
					this._customRequest("repositories", "GET", lang.hitch(this, this._adminModeSelects));
				} else {
					this._customRequest("repositories", "GET", lang.hitch(this, this._userModeSelects));
				}

				// Init FMEserver Status module
				this._portalStatus = new Status(this.options).placeAt(this.options.map.root, "last");

			},

			_adminModeSelects : function (repos) {

				// If current user have permission to access repositorys, repos.length > 0
				if (repos && repos.length > 0) {

					var workspacesdata = [],
					reposdata = [],
					promises = [];

					// Iterate through all repositorys
					array.forEach(repos, lang.hitch(this, function (repo) {

							var deferred = new Deferred();
							promises.push(deferred);

							reposdata.push({
								id : repo.name,
								label : repo.name
							});

							// Get all workspaces in the current repository
							this._customRequest("repositories/" + repo.name + "/items", "GET", function (workspaces) {
								array.forEach(workspaces, function (workspace) {
									workspacesdata.push({
										id : workspace.name,
										label : workspace.name,
										repo : repo.name
									});
								});
								deferred.resolve();
							});
						}));

					// When all workspaces has been collected, create selectors...
					all(promises).then(lang.hitch(this, function () {

							// Destroy existing workspace select
							if (this._wsSelect) {
								this._wsSelect.destroy();
							}

							this._wsSelect = new Select({
									"store" : new ObjectStore({
										objectStore : new Memory({
											data : workspacesdata
										})
									}),
									"style" : "width:250px;"
								}).placeAt(this._workspaceSelector, "last");
							Utils.show(this._workspaceSelector);
							this._wsSelect.startup();
							this._wsSelect.set("query", {
								repo : reposdata[0].id
							});

							// Destroy existing repository select
							if (this._rsSelect) {
								this._rsSelect.destroy();
							}

							this._rsSelect = new Select({
									"store" : new ObjectStore({
										objectStore : new Memory({
											data : reposdata
										})
									}),
									"style" : "width:250px;"
								}).placeAt(this._repositorySelector, "last");
							Utils.show(this._repositorySelector);
							this._rsSelect.startup();

							// Events for repository selection
							this._eventHandles.push(this._rsSelect.on('change', lang.hitch(this, function () {
										var repository = this._rsSelect.get('value');
										this._wsSelect.set("query", {
											repo : repository
										});

										var workspace = this._wsSelect.get('value');
										this._buildFmeForm({
											repo : repository,
											id : workspace
										});
									})));

							// Event for workspace selection
							this._eventHandles.push(this._wsSelect.on('change', lang.hitch(this, function () {
										var repository = this._rsSelect.get('value');
										var workspace = this._wsSelect.get('value');
										this._buildFmeForm({
											repo : repository,
											id : workspace
										});
									})));

							Utils.hide(this._loadingContent);
						}));

				} else { // No repository permissions
					Utils.hide(this._loadingContent);
					topic.publish("FMEPortal/alert", this.options.settings.fme.general.title, this.nls.Login.Messages.NoPermission);
				}

			},

			_userModeSelects : function (repos) {

				var repoPermissions = [];

				// Add the accessible repositorys to repoPermissions
				array.forEach(repos, function (repo) {
					repoPermissions.push(repo.name);
				});

				var workspacesdata = [];
				workspacesdata.push({
					id : -1,
					label : "-- " + this.nls.Widget.Step2.ChooseWorkspace + " -- ",
					disabled : true
				});

				// Get workspaces from the configuration parameter includedWorkspaces
				array.forEach(this.options.settings.fme.includedWorkspaces, function (ws) {
					workspacesdata.push({
						id : ws.workspace,
						label : ws.title,
						repo : ws.repository,
						description : ws.description,
						service : ws.service,
						permission : repoPermissions.indexOf(ws.repository) !== -1 // Set permission
					});
				});

				if (this._wsSelect) {
					this._wsSelect.destroy();
				}
				this._wsSelect = new Select({
						"store" : new ObjectStore({
							objectStore : new Memory({
								data : workspacesdata
							})
						}),
						"style" : "width:250px;"
					}).placeAt(this._workspaceSelector, "last");
				Utils.show(this._workspaceSelector);
				this._wsSelect.startup();

				// Selecting a workspace event
				this._eventHandles.push(this._wsSelect.on('change', lang.hitch(this, function () {

							this._wsSelect.set('disabled', true);

							var store = this._wsSelect.get('store');
							var value = this._wsSelect.get('value');

							// Remove existing permission message
							this._permissionMessage ? domConstruct.destroy(this._permissionMessage) : null;

							if (value !== -1) {
								store.get(value).then(lang.hitch(this, function (ws) {
										if (ws.permission) { // User has permission to access selected workspace
											this._buildFmeForm(ws);
										} else { // No permission, show permission denied message
											this._activeForm ? this._activeForm.destroy() : null;
											this._permissionMessage = domConstruct.create("div", {
													"class" : "fmeportal-denied",
													"innerHTML" : this.nls.Login.Messages.NoWorkspacePermission
												});
											domConstruct.place(this._permissionMessage, this._formContent, "last");
											this._wsSelect.set('disabled', false);
										}
									}));
							} else {
								topic.publish("FMEPortal/hideGeometryTools");
								this._activeForm ? this._activeForm.destroy() : null; // Nothing selected, destroy form
								this._activeForm = null;
								this._wsSelect.set('disabled', false);
							}
						})));

			},

			_buildFmeForm : function (ws) {

				// Notify Toolbar to hide drawing tools
				topic.publish("FMEPortal/hideGeometryTools");

				if (this._activeForm) {
					this._activeForm.destroy();
				}
				Utils.show(this._loadingParams);

				// Get workspace parameters and build the form
				FMEServer.getWorkspaceParameters(ws.repo, ws.id, lang.hitch(this, function (json) {

						if (json && json.message === "Authentication failed: Failed to login") {
							topic.publish("FMEPortal/alert", this.options.settings.fme.general.title, this.nls.Login.Messages.Expired);
							this._removeExistingToken();
							this._logoutButton.destroy();
							this._loginStatus.innerHTML = "";
							this._showLogin();
							return;
						}

						// List options encoded as unicode tags "Prim<u00e4>rkarta", decode them...
						array.forEach(json, lang.hitch(this, function (param) {
								array.forEach(param.listOptions, lang.hitch(this, function (option) {
										option.caption = this._decodeUnicode(option.caption);
									}));
							}));

						Utils.hide(this._loadingParams);

						this._activeForm = new GenerateFmeForm({
								options : this.options,
								parameters : json,
								ws : ws
							}).placeAt(this._formContent, "last");

						// Show workspace information button and service type selector, adminMode = true only
						if (this.options.settings.fme.server.adminMode) {
							if (registry.byId("fmeportal-details")) {
								registry.byId("fmeportal-details").destroy();
							}
							this._customRequest("repositories/" + ws.repo + "/items/" + ws.id, "GET", lang.hitch(this, function (details) {
									this._detailsButton = new Button({
											"id" : "fmeportal-details",
											"label" : this.nls.WorkspaceInfo.ButtonLabel,
											"style" : "margin:5px;",
											"onClick" : lang.hitch(this, function () {
												this._workspaceInfo = new WorkspaceInfo(details);
												topic.publish("FMEPortal/alert", this.nls.WorkspaceInfo.Label + " " + ws.id, this._workspaceInfo);
											})
										}).placeAt(this._formContent, "last").startup();
									this._wsSelect.set('disabled', false);

									this._activeForm.addServiceSelect(details);

								}), "detail=high");

						} else {
							this._wsSelect.set('disabled', false);
						}

					}));

			},

			_customRequest : function (command, type, callback, parameters, contentType) {

				if (command && type && callback) {
					FMEServer.customRequest(this.options.settings.fme.server.url + "/fmerest/" + this.options.settings.fme.server.version + "/" + command, type, callback, parameters, contentType || "application/json");
				}

			},

			_decodeUnicode : function (str) {
				var re = /<u\s*\w.*?>/g;
				var matches = str.match(re);
				array.forEach(matches, lang.hitch(this, function (match) {
						var decoded = match;
						decoded = decoded.replace("<", "\\").replace(">", "");
						decoded = decodeURIComponent(JSON.parse("\"" + decoded + "\""));
						str = str.replaceAll(match, decoded);
					}));
				return str;
			},

			destroy : function () {
				this.inherited(arguments);
			}

		});
	return Widget;
});
