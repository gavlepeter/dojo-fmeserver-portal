/*property
_v2_runWorkspaceWithData, constructor, length, paramnames, params,
serverUrl, service
 */
/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@version 1.0
@author Peter Jäderkvist <peter.jaderkvist@gavle.se>
@module FMEPortal/RestManager/v2RestCalls
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/Deferred"
	],
	function (
		declare,
		lang,
		Deferred) {

	return declare(null, {

		constructor : function () {},

		_v2_runWorkspaceWithData : function (repository, workspace, paths, params) {

			var deferred = new Deferred();
			var requestUrl = this.serverUrl + "/" + params.service + '/' + repository + '/' + workspace + '?';
			var extra = params.params;

			// Multiple file uploads
			var paramsString = "";
			for (i = 0; i < params.paramnames.length; i++) {
				paramsString += params.paramnames[i] + '=%22%22';
				for (var f in params.files[i]) {
					paramsString += paths[i] + '/' + params.files[i][f].name + '%22%20%22';
				}
				paramsString += '&';
			}

			paramsString += this._toParameterString({
				"opt_responseformat" : "json",
				"token" : this.token
			}) + "&" + (extra || "");

			this._ajax(requestUrl + paramsString).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_runDataDownload : function (repository, workspace, params) {

			var deferred = new Deferred();
			var requestUrl = this.serverUrl + '/fmedatadownload/' + repository + '/' + workspace;

			params = this._toParameterString({
					"opt_responseformat" : "json",
					"opt_showresult" : true,
					"token" : this.token
				}) + "&" + (params || "");

			this._ajax(requestUrl, "POST", params, 'application/x-www-form-urlencoded;charset=utf-8').then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_runDataStreaming : function (repository, workspace, params) {

			var deferred = new Deferred();
			var requestUrl = this.serverUrl + '/fmedatastreaming/' + repository + '/' + workspace;

			params = this._toParameterString({
					"opt_showresult" : true,
					"token" : this.token
				}) + "&" + (params || "");

			this._ajax(requestUrl, "POST", params, 'application/x-www-form-urlencoded;charset=utf-8').then(lang.hitch(this, function (results, responseType) {
					if (results.success) {
						deferred.resolve(results);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;

		},

		_v2_submitSyncJob : function (repository, workspace, params) {

			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/transformations/commands/transact/" + repository + "/" + workspace;

			this._ajax(requestUrl, "POST", params, 'application/json').then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;

		},

		_v2_generateToken : function (user, password, count, unit) {
			var deferred = new Deferred();

			var requestUrl = this.serverUrl + "/fmetoken/service/generate";

			var params = this._toParameterString({
					"user" : user,
					"password" : password,
					"expiration" : count,
					"timeunit" : unit
				});

			this._ajax(requestUrl, 'POST', params, 'application/x-www-form-urlencoded;charset=utf-8').then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getRepositories : function () {
			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/repositories";

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve({
							"items" : results.data
						})
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getResources : function () {

			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/resources";

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getWorkspacesForRepository : function (repository) {
			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/repositories/" + repository + "/items";

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve({
							"items" : results.data
						})
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getWorkspaceParameters : function (repository, workspace) {
			var deferred = new Deferred();

			var requestUrl = this.restUrl + "/repositories/" + repository + '/items/' + workspace + '/parameters';

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getWorkspaceInfo : function (repository, workspace) {
			var deferred = new Deferred();

			var requestUrl = this.restUrl + "/repositories/" + repository + '/items/' + workspace;

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getSession : function (repository, workspace) {
			var deferred = new Deferred();

			var requestUrl = this.serverUrl + "/fmedataupload/" + repository + "/" + workspace;

			var params = this._toParameterString({
					"opt_extractarchive" : false,
					"opt_pathlevel" : 3,
					"opt_fullpath" : true,
					"token" : this.token
				});

			this._ajax(requestUrl, "POST", params, "application/x-www-form-urlencoded;charset=utf-8").then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;

		},

		_v2_dataUpload : function (repository, workspace, uploader, session) {

			var deferred = new Deferred();

			session = session || null;
			var requestUrl = this.serverUrl + "/fmedataupload/" + repository + "/" + workspace;

			if (session !== null) {
				requestUrl += ';jsessionid=' + session;
			}

			requestUrl += "?" + this._toParameterString({
				"opt_extractarchive" : true,
				"opt_pathlevel" : 3,
				"opt_fullpath" : true
			});

			var params = new FormData();

			for (var i = 0; i < uploader.files.length; i++) {
				params.append('files[]', uploader.files[i]);
			}
			params.append('token', this.token);

			this._ajax(requestUrl, "POST", params).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;
		},

		_v2_getRunningJobs : function () {

			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/transformations/jobs/running";

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;

		},

		_v2_getQueuedJobs : function () {

			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/transformations/jobs/queued";

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;

		},

		_v2_getInfo : function () {

			var deferred = new Deferred();
			var requestUrl = this.restUrl + "/info";

			this._ajax(requestUrl).then(lang.hitch(this, function (results) {
					if (results.success) {
						deferred.resolve(results.data);
					} else {
						deferred.resolve(results);
					}
				}));
			return deferred;

		},

		_toParameterString : function (parameters) {
			var list = "";
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key)) {
					list += key + "=" + parameters[key] + "&";
				}
			}
			return list.indexOf("&") !== -1 ? list.slice(0, -1) : list;
		}
	});
});
