/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@version 1.0
@author Peter Jäderkvist <peter.jaderkvist@gavle.se>
@module FMEPortal/RestManager
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/Deferred",
		"dojo/request/xhr",

		"./RestManager/v2RestCalls",
		"./RestManager/v3RestCalls"
],
	function (
		declare,
		lang,
		array,
		Deferred,
		xhr,
		v2RestCalls,
		v3RestCalls) {

	    // Mixin methods for different FME Server REST API versions
	    return declare("FmePortal-RestManager", [v2RestCalls, v3RestCalls], {

	        isInitialized: false,

	        constructor: function (options) {
	            this.options = lang.mixin(this.options, options);
                this.restVersion = this.options.settings.fme.server.version;
                this.sessionId = Number(new Date()); // Set unique session number

	            this._setupAPIMethods();
	        },

	        init: function (config) {
	            if (config.server && config.token) {
	                this.token = config.token;

	                // Set URLs
	                this.serverUrl = config.server;
	                this.restUrl = config.server + "/fmerest/" + this.restVersion;

	                this.isInitialized = true;
	            }

	        },

	        _setupAPIMethods: function () {

	            array.forEach([
                        "generateToken",
                        "dataUpload",
                        "runWorkspaceWithData",
                        "runDataDownload",
                        "runDataStreaming",
                        "submitJob",
                        "submitSyncJob",
                        "getRepositories",
                        "getResources",
                        "getSession",
                        "getInfo",
                        "getWorkspacesForRepository",
                        "getWorkspaceParameters",
                        "getWorkspaceInfo",
                        "getRunningJobs",
                        "getQueuedJobs"
	            ], lang.hitch(this, function (method) {
	                this[method] = function () {
	                    var methodName = "_" + this.restVersion + "_" + method;
	                    if (typeof this[methodName] === "function") {
	                        return this[methodName].apply(this, arguments);
	                    } else {
	                        var deferred = new Deferred();
	                        deferred.resolve({
	                            "error": method + " is not implemented for API version " + this.restVersion
	                        });
	                        return deferred;
	                    }
	                };
	            }));
	        },

	        _ajax: function (url, requestType, params, contentType, acceptType) {

	            var deferred = new Deferred();

	            var data = null,
                query = null;
	            if ((params && params.get && params.get("files[]")) || params && params.append) { // FormData()
	                data = params;
	            } else if (params && params.publishedParameters) { // Query object
	                data = JSON.stringify(params);
	            } else { // query string parameters
	                query = params;
	            }

	            if (this.restVersion === "v2") {
	                url += url.indexOf('?') !== -1 ? '&detail=high' : '?detail=high';
	            }

	            var responseType;
	            xhr(url, {
	                method: requestType || "GET",
	                query: query,
	                data: data,
	                headers: {
	                    "Accept": acceptType || "application/json",
	                    "Content-Type": contentType || null,
	                    "Authorization": "fmetoken token=" + this.token
	                }
	            }).then(function (data) {
	                var json;
	                try {
	                    json = JSON.parse(data);
	                } catch (e) { }
	                deferred.resolve({
	                    "success": true,
	                    "data": json || data,
	                    "responseType": responseType
	                });

	            }, function (error) {
	                var json;
	                try {
	                    json = JSON.parse(error.response.data);
	                } catch (e) { }
	                deferred.resolve({
	                    "success": false,
	                    "data": json || error
	                });
	            }, function (evt) {
	                responseType = evt.getHeader("Content-Type");
	            });

	            return deferred;

	        }
	    });
	});
