/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@author Peter Jäderkvist <p.jaderkvist@gmail.com>
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
