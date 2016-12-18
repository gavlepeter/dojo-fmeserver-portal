/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@version 1.0
@author Peter Jäderkvist <peter.jaderkvist@gavle.se>
@module FMEPortal/Utils
 */
define([
		"dojo/dom-style"
	],
	function (
		domStyle) {

	return {
		show : function (node) {
			if (node) {
				domStyle.set(node, "display", "block");
			}

		},

		hide : function (node) {
			if (node) {
				domStyle.set(node, "display", "none");
			}
		},

		toggle : function (node) {
			if (node) {
				if (domStyle.get(node, "display") === "none") {
					domStyle.set(node, "display", "block");
				} else {
					domStyle.set(node, "display", "none");
				}
			}

		}
	}
});
