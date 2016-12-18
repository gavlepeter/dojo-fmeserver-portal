/*
 dojo-fmeserver-portal
 https://github.com/gavlepeter/dojo-fmeserver-portal
 @version 1.0
 @author Peter Jäderkvist <peter.jaderkvist@gavle.se>
 @module FMEPortal/FileUpload
*/
define([
        "require",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/on",
		"dojo/text!./templates/file-upload.html",
		"dojo/dom-class",
		"dojo/dom-construct",
		"dojo/query",
		"./Utils",
        "dojo/i18n!./nls/resources",
		"dojox/form/uploader/FileList",
        "dijit/registry",
        "dijit/ConfirmDialog",
		"dijit/form/CheckBox",
		"dijit/form/Form",
		"dojox/form/Uploader",
		"dijit/form/Button",
        "dijit/form/TextBox"
	],
	function (
        require,
		declare,
		lang,
		array,
		_WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
		on,
		dijitTemplate,
		domClass,
        domConstruct,
        query,
        Utils,
        resourceStrings,
		UploaderFileList,
        registry,
        ConfirmDialog,
        CheckBox
        ) {
	return declare("FmePortal-FileUpload", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString : dijitTemplate,
		widgetsInTemplate : true,

		constructor: function (options) {

		    this.options = options;
		    this.nls = resourceStrings;
		    this.loaderAnim = require.toUrl("./images/loader.gif");

			this.set("paramname", this.options.parameter.name);
			this.set("description", this.options.parameter.description);
			this.set("disabledFiles", this.options.settings.fme.uploadSettings.disabledFiles);

			FMEServer.getSession(this.options.repository, this.options.workspace, lang.hitch(this, function (json) {
			    if (json.serviceResponse.files) {
			        this.set("session", json.serviceResponse.session);
			        this.set("path", json.serviceResponse.files.folder[0].path);
				}
			}));
		},

		postCreate : function () {
			this.inherited(arguments);

			this._uploader.startup();

			var list = new UploaderFileList({
				uploader : this._uploader,
				headerFilename: this.nls.FileUpload.FileList.Name,
				headerFilesize : this.nls.FileUpload.FileList.Size,
				headerType: this.nls.FileUpload.FileList.Type
			}).placeAt(this._fileList);

			list.startup();

			this.own(
				on(this._uploader, 'change', lang.hitch(this, function (files) {
				    if (files && files.length > 0) {
				        Utils.show(this._fileContainer);
				    } else {
				        Utils.hide(this._fileContainer);
				    }
				})),
                on(this._submit, 'click', lang.hitch(this, function () {
                    Utils.show(this._uploading);
                    var uploader = query('input', this._uploader.domNode)[0];
                    FMEServer.dataUpload(this.options.repository, this.options.workspace, uploader, this.get('session'), lang.hitch(this, this._processUploadedFiles));
                }))
            );

		},

		_processUploadedFiles : function (json) {

			// Clear list of uploaded files
			if (this._uploadedFilesList && this._uploadedFilesList.length > 0) {
				array.forEach(this._uploadedFilesList, function (dijit) {
					if (dijit) {
					    dijit.destroy();
					}
				});
				this._uploadedFilesList = [];
			} else {
				this._uploadedFilesList = [];
			}

			if (json.serviceResponse !== undefined) {
			    this._uploadedFiles.innerHTML = "";
			    this._files = json.serviceResponse.files.file;

			    var labelString, label, checkbox, fileEndingRegex, fileType;
				for (file in this._files) {

                    // Bad encoding for Swedish filename characters from FME-server
					labelString = this._getLabelString(this._files[file]);

					label = domConstruct.toDom("<label> " + labelString + "</label>");
					domConstruct.place(label, this._uploadedFiles, "last");

					checkbox = new CheckBox({
						name : this._files[file].name
					});

					// Grab file ending
					fileEndingRegex = /\.[0-9a-z]{1,5}$/i;
					fileType = (this._files[file].name.toLowerCase()).match(fileEndingRegex)[0];

					if (this.disabledFiles.indexOf(fileType) !== -1) {
						checkbox.set('disabled', true);
						domClass.add(label, "fmeportal-disabled");
					}

					this._uploadedFilesList.push(checkbox);

					checkbox.placeAt(label, "first");
					checkbox.startup();
				}
				Utils.show(this._uploadedContainer);
			}

			Utils.hide(this._uploading);
		},

		getValues: function () {
            
            // Return Uploaded files
			var filteredFiles = [];
			if (this._uploadedFilesList && this._uploadedFilesList.length > 0) {
				array.forEach(this._uploadedFilesList, lang.hitch(this, function (checkbox) {
					if (checkbox.get('checked')) {
						array.forEach(this._files, function (file) {
							if (checkbox.get('name') === file.name) {
								filteredFiles.push(file);
							}
						});
					}
				}));
			}

			if (filteredFiles.length > 0) {
			    return {
			        files: filteredFiles
			    };
			}
			
		},

        // Fix filenames encoding issue
		_getLabelString : function (file) {
			return file.name
				.replace("Ã¤", "ä")
				.replace("Ã¥", "å")
				.replace("Ã¶", "ö")
				.replace("Ã…", "Å")
				.replace("Ã„", "Ä")
				.replace("Ã–", "Ö");
		},

		destroy : function () {
			this.inherited(arguments);
		}
	});
});
