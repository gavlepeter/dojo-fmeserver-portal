/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@version 1.0
@author Peter Jäderkvist <peter.jaderkvist@gavle.se>
@module FMEPortal/Login
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/Evented",
		"dojo/on",
		"dojo/text!./templates/login.html",
		"dojo/keys",

		"dojo/i18n!./nls/resources",

		"dijit/layout/TabContainer",
		"dijit/layout/ContentPane",
		"dijit/form/ValidationTextBox",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/CheckBox",
		"dijit/layout/TabController"

	],
	function (
		declare,
		lang,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		on,
		dijitTemplate,
		keys,
		resourceStrings) {

	return declare("FmePortal-Login", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

		templateString : dijitTemplate,
		widgetsInTemplate : true,

		constructor : function (options) {

			this.options = options;
			this.nls = resourceStrings;
		},

		postCreate : function () {
			this.inherited(arguments);

			this._adminMode.set('checked', this.options.settings.fme.server.adminMode);

			// Register click and keydown events for login
			// Emit form values to login listener
			this.own(
				on(this._login, 'click', lang.hitch(this, function () {
						this._loginStatus.innerHTML = "";
						if (this._fmeLoginForm.validate()) {
							this.emit("login", this._fmeLoginForm.get('value'), this._getSettings());
						}
					})),
				on(this._tokenLogin, 'click', lang.hitch(this, function () {
						this._tokenStatus.innerHTML = "";
						if (this._fmeTokenForm.validate()) {
							this.emit("tokenLogin", this._fmeTokenForm.get('value'), this._getSettings());
						}

					})),
				on(this._fmeLoginForm, "keydown", lang.hitch(this, function (event) {
						var handled = false;
						if (event.keyCode !== undefined) {
							if (event.keyCode === keys.ENTER) {
								if (this._fmeLoginForm.validate()) {
									this.emit("login", this._fmeLoginForm.getValues());
								}
								handled = true;
							}
						}
						if (handled) {
							event.preventDefault();
						}
					})));

		},

		startup : function () {

			this.inherited(arguments);
			this._tabContainer.startup();

			if (!this.options.settings.fme.server.token.showTokenTab) {
				this._tokenTab.controlButton.set('disabled', true);
			}

			if (!this.options.settings.fme.server.showSettingsTab) {
				this._settingsTab.controlButton.set('disabled', true);
			}

		},

		setTokenStatus : function (message) {
			this._tokenStatus.innerHTML = message;
		},

		setLoginStatus : function (message) {
			this._loginStatus.innerHTML = message;
		},

		_getSettings : function () {
			return {
				"adminMode" : this._adminMode.get('checked'),
				"url" : this._serverUrl.get('value')
			};
		},

		destroy : function () {
			this.inherited(arguments);
		}

	});
});
