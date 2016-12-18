/*
 dojo-fmeserver-portal
 https://github.com/gavlepeter/dojo-fmeserver-portal
 @version 1.0
 @author Peter Jäderkvist <peter.jaderkvist@gavle.se>
 @module FMEPortal/Toolbar/Buffer
*/
define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/dom-style',
		'dijit/PopupMenuItem',
		'dijit/TooltipDialog',
		'./BufferInput'

], function (
		declare,
		lang,
		domStyle,
		PopupMenuItem,
		TooltipDialog,
		BufferInput) {
    return declare(PopupMenuItem, {
        constructor: function (options) {
            options = options || {};
            lang.mixin(this, options);
        },
        postCreate: function () {

            this.inherited(arguments);

            var bufferInput = new BufferInput();

            this.popup = new TooltipDialog({
                style: 'width:200px;',
                content: bufferInput
            });

            domStyle.set(this.popup.connectorNode, 'display', 'none');
            this.popup.startup();
        }
    });
});
