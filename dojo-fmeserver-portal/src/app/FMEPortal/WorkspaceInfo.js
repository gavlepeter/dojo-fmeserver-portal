/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@author Peter Jäderkvist <p.jaderkvist@gmail.com>
@module FMEPortal/WorkspaceInfo
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/Evented",
		"dojo/text!./templates/workspace-info.html",
		"dojo/i18n!./nls/resources"
	],
	function (
		declare,
		lang,
		array,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		dijitTemplate, resourceStrings) {
	var Widget = declare("FmePortal-Workspace-Info", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

			templateString : dijitTemplate,
			widgetsInTemplate : true,
			baseClass : "fmeportal",

			options : {},

			constructor : function (options) {
				this.options = lang.mixin(this.options, options);
				this.nls = resourceStrings;

				// Split history, multiple lines
				var arr = this.options.history.split(",");
				this.options.history = "";
				array.forEach(arr, lang.hitch(this, function (history, i) {
						this.options.history += history + " ";
						if (((i + 1) % 3) === 0) {
							this.options.history += "<br/>";
						}
					}));

				// Split resources, multiple lines
				var resources = "";
				array.forEach(this.options.resources, lang.hitch(this, function (resource) {
						resources += resource.name + "<br/>";
					}));
				this.options.resources = resources;

				// Split services, multiple lines
				var services = "";
				array.forEach(this.options.services, lang.hitch(this, function (service) {
						services += service.displayName + "<br/>";
					}));
				this.options.services = services;

			},

			postCreate : function () {
				this.inherited(arguments);

			},

			destroy : function () {
				this.inherited(arguments);
			}

		});
	return Widget;
});
