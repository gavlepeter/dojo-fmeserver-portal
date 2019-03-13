/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@author Peter Jäderkvist <p.jaderkvist@gmail.com>
@module FMEPortal/Status
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
		"dojo/text!./templates/status.html",
		"dojo/i18n!./nls/resources",
		"dojo/topic",
		"./Utils"
	],
	function (
		require,
		declare,
		lang,
		array,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		dijitTemplate,
		resourceStrings,
		topic, Utils) {
	var Widget = declare("FmePortal-Status", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

			templateString : dijitTemplate,
			widgetsInTemplate : true,

			options : {},

			constructor: function (options) {

			    this.options = lang.mixin(this.options, options.settings);
			    this.FMERestManager = options.restManager;

				this.nls = resourceStrings;

				this._apiUrl = this.options.settings.fme.server.url;
				this._restVersion = this.options.settings.fme.server.version;

				this._addTopics();

			},

			postCreate : function () {
				this.inherited(arguments);

				if (!this.options.settings.fme.server.adminMode) {
					Utils.hide(this._running);
					Utils.hide(this._queued);
				}
				Utils.hide(this.domNode);

			},

			_addTopics : function () {
				this.own(
					topic.subscribe("FMEPortal/orderStart", lang.hitch(this, function () {
						this._statusInterval = setInterval(lang.hitch(this, this._queryFmeServerStatus), 2000);
					})),
					topic.subscribe("FMEPortal/orderComplete", lang.hitch(this, function () {
						clearInterval(this._statusInterval);
						Utils.hide(this.domNode);
					})));
			},
			_requestCompleteRunning : true,
			_requestCompleteQueued : true,
			_queryFmeServerStatus: function () {

				if (this._requestCompleteRunning) {
					this._requestCompleteRunning = false;
                    this.FMERestManager.getRunningJobs().then(lang.hitch(this, function(response) {

                        if (response && (response.data || response.items)) {
                            response = response.data || response.items;
                        }

					    var jobs = response;

						if (jobs && jobs.message && jobs.message.contains("Unauthorized request")) {
							clearInterval(this._statusInterval);
							this.destroy();
							return;
						}

						Utils.show(this.domNode);

						this._requestCompleteRunning = true;

						if (jobs.length === 0) {
							this._runningTitle.innerHTML = this.nls.Status.RunningJobs + " (0)";
							this._running.innerHTML = this.nls.Status.NoRunningJobs;
							return;
						}

						this._runningTitle.innerHTML = this.nls.Status.RunningJobs + " (" + jobs.length + ")";
						this._running.innerHTML = "";
						array.forEach(jobs, lang.hitch(this, function (job) {
                            this._running.innerHTML += "<img src='" + require.toUrl("./images/loader.gif") + "' /> " + job.id + ", " + job.request.workspacePath.split("/")[1] + " <b>" + job.engineName + "</b><br />";
							}));
					}));
			    }

				if (this._requestCompleteQueued) {
					this._requestCompleteQueued = false;
					this.FMERestManager.getQueuedJobs().then(lang.hitch(this, function (response) {

                        if (response && (response.data || response.items)) {
                            response = response.data || response.items;
                        }

					    var jobs = response;

						if (jobs && jobs.message && jobs.message.contains("Unauthorized request")) {
							clearInterval(this._statusInterval);
							this.destroy();
							return;
						}

						Utils.show(this.domNode);

						this._requestCompleteQueued = true;
						if (jobs.length === 0) {
							this._queuedTitle.innerHTML = this.nls.Status.QueuedJobs + " (0)";
							this._queued.innerHTML = this.nls.Status.NoQueuedJobs;
							return;
						}

						this._queuedTitle.innerHTML = this.nls.Status.QueuedJobs + " (" + jobs.length + ")";
						this._queued.innerHTML = "";
						array.forEach(jobs, lang.hitch(this, function (job) {
								this._queued.innerHTML += job.id + ", " + job.request.workspacePath.split("/")[1] + " <b>" + job.engineName + "</b><br />";
							}));
					}));
				}
			},

			destroy : function () {
				this.inherited(arguments);
			}

		});
	return Widget;
});
