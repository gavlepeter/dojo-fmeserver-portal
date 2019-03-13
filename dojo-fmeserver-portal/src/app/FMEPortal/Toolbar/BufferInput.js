/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@author Peter Jäderkvist <p.jaderkvist@gmail.com>
@module FMEPortal/Toolbar/BufferInput
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/Evented",
		"dojo/text!../templates/buffer.html",
		"dojo/i18n!../nls/resources",
		"dojo/topic",
		"dijit/form/NumberTextBox",
		"dijit/form/Button"
	],
	function (
		declare,
		lang,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		dijitTemplate, resourceStrings, topic) {
	var Widget = declare("FmePortal-Buffer-Input", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

			templateString : dijitTemplate,
			widgetsInTemplate : true,

			options : {},

			constructor : function (options) {
				this.options = lang.mixin(this.options, options);
				this.nls = resourceStrings;

			},

			postCreate : function () {

				this._setBuffer.on('click', lang.hitch(this, function () {

						if (this._bufferVal.get('value') < 0 || this._bufferVal.get('value') > 0) {
							topic.publish("FMEPortal/buffer", this._bufferVal.get('value'));
						}

					}));

			},
			destroy : function () {
				this.inherited(arguments);
			}

		});
	return Widget;
});
