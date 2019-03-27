/*
dojo-fmeserver-portal
https://github.com/gavlepeter/dojo-fmeserver-portal
@author Peter Jäderkvist <p.jaderkvist@gmail.com>
@module FMEPortal/Toolbar
 */
define([
		"dojo/_base/declare",
		"dojo/_base/lang",
        "dojo/_base/event",
        "dojo/_base/array",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/Evented",
		"dojo/on",
		"dojo/text!./templates/toolbar.html",
		"dojo/topic",

		"./Utils",
		"./Toolbar/Buffer",

		"dojo/i18n!./nls/resources",

		"esri/toolbars/draw",
		"esri/toolbars/edit",
		"esri/layers/GraphicsLayer",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/Color",
		"esri/graphic",
		"esri/geometry/Polygon",
		"esri/geometry/Extent",
		"esri/geometry/webMercatorUtils",
		"esri/tasks/AreasAndLengthsParameters",
		"esri/tasks/BufferParameters",
		"esri/tasks/GeometryService",
		"esri/config",

		"dijit/Menu",
		"dijit/form/Button",
		"dijit/form/NumberTextBox",
        "dijit/form/Form",
        "dijit/form/CheckBox",
		"dijit/Fieldset"

	],
	function (
		declare,
		lang,
        event,
        array,
		_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
		on,
		dijitTemplate,
		topic, Utils, Buffer, resourceStrings,

		Draw, Edit, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, Graphic, Polygon, Extent,
		webMercatorUtils,
		AreasAndLengthsParameters, BufferParameters, GeometryService, esriConfig,

		Menu) {
	var Widget = declare("FmePortal-Toolbar", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

			templateString : dijitTemplate,
			widgetsInTemplate : true,
			baseClass : "fmeportal-toolbar",

			_activeColor : null,
			_bufferColor : null,

			constructor : function (options) {
				this.options = options;
				this.nls = resourceStrings;

				this._activeColor = this.options.settings.map.drawColor;
				this._bufferColor = this.options.settings.map.bufferColor;

				esriConfig.defaults.geometryService = new GeometryService(this.options.settings.map.geometryService);

				this._toolbar = new Draw(this.options.map); // Draw toolbar for geometry creation
				this._editor = new Edit(this.options.map); // Edit existing geometry

				this.own(
					on(this._toolbar, "draw-end", lang.hitch(this, this._addToMap)),
					on(this._editor, "deactivate", lang.hitch(this, function (evt) {
							this._refreshArea(evt.graphic.geometry);
							this._setGeometryParameter(evt.graphic.geometry);
						})),
					on(this._editor, "activate", lang.hitch(this, function (evt) {
							this._drawnArea.innerHTML = this.nls.Toolbar.Edit;
						})));

				// Add drawing-layers
				this._createBufferLayer();
				this._createDrawLayer();

				// Add graphic right click menu
				this._createGraphicsToolsMenu();

				this._addTopics();

			},

			_createBufferLayer : function () {
				this._bufferGraphicsLayer = new GraphicsLayer();
				this.options.map.addLayer(this._bufferGraphicsLayer);
			},

			_createDrawLayer : function () {

				this._drawGraphicsLayer = new GraphicsLayer();
				this.options.map.addLayer(this._drawGraphicsLayer);

				this.own(
					on(this._drawGraphicsLayer, "mouse-over", lang.hitch(this, function (evt) {
							this._selectedGraphic = evt.graphic;
							this._graphicToolsMenu.bindDomNode(evt.graphic.getDojoShape().getNode());
						})),
					on(this._drawGraphicsLayer, "mouse-out", lang.hitch(this, function (evt) {
							this._graphicToolsMenu.unBindDomNode(evt.graphic.getDojoShape().getNode());
						})),
					on(this._drawGraphicsLayer, "click", lang.hitch(this, function (evt) {
							if (!this._drawingEnabled) {
								event.stop(evt);
								if (this._editingEnabled) {
									this._editingEnabled = false;
									this._editor.deactivate();
								} else {
									this._editor.activate(Edit.MOVE | Edit.SCALE | Edit.EDIT_VERTICES | Edit.ROTATE | Edit.EDIT_TEXT, evt.graphic);
									this._editingEnabled = true;
								}
							}
						})),
					on(this.options.map, 'click', lang.hitch(this, function () {
							if (this._editingEnabled) {
								this._editingEnabled = false;
								this._editor.deactivate();
							}
						})));
			},

			_addTopics : function () {

				// Buffer the active geometry
				topic.subscribe("FMEPortal/buffer", lang.hitch(this, function (bufferAmount) {

						if (this._bufferGraphicsLayer.graphics.length === 0) {
							var symbol = new SimpleFillSymbol();
							symbol.setColor(new Color(this._bufferColor));
							this._bufferGraphicsLayer.add(new Graphic(this._drawGraphicsLayer.graphics[0].geometry, symbol));
						}

						var params = new BufferParameters();
						params.distances = [bufferAmount];
						params.outSpatialReference = this.options.map.spatialReference;
						params.unit = GeometryService["UNIT_METER"];
						params.unionResults = true;
						params.geometries = [this._bufferGraphicsLayer.graphics[0].geometry];

						esriConfig.defaults.geometryService.buffer(params, lang.hitch(this, function (geometries) {
								this._drawGraphicsLayer.clear();
								this._addToMap({
									geometry : geometries[0]
								});
							}));

					}));

				topic.subscribe("FMEPortal/showGeometryTools", lang.hitch(this, function () {
						Utils.show(this._geometryTools);
						Utils.hide(this._noTools);
					}));

				topic.subscribe("FMEPortal/hideGeometryTools", lang.hitch(this, function () {
						Utils.hide(this._geometryTools);
						Utils.show(this._noTools);
					}));

			},

			_addToMap : function (evt) {
				var symbol, geometry, geometryPolygon;

                if (!this._drawMulti.get('checked')) {
                    this._toolbar.deactivate();
                }

				switch (evt.geometry.type) {
				case "point":
				case "multipoint":
					geometry = evt.geometry;
					symbol = new SimpleMarkerSymbol();
					symbol.setColor(new Color(this._activeColor));
					break;
				case "polyline":
					geometry = evt.geometry;
					symbol = new SimpleLineSymbol();
					symbol.setWidth(5);
					symbol.setColor(new Color(this._activeColor));
					break;
				case "polygon":
					geometry = evt.geometry;
					symbol = new SimpleFillSymbol();
					symbol.setColor(new Color(this._activeColor));
					break;
				case "extent":
					geometry = evt.geometry;
					symbol = new SimpleFillSymbol();
					symbol.setColor(new Color(this._activeColor));
					geometryPolygon = new Polygon(this.options.map.spatialReference);
					geometryPolygon.addRing([[geometry.xmin, geometry.ymin], [geometry.xmin, geometry.ymax], [geometry.xmax, geometry.ymax], [geometry.xmax, geometry.ymin], [geometry.xmin, geometry.ymin]]);
					geometry = geometryPolygon;
					break;
				}

                if (this._drawMulti.get('checked')) {
                    if (this._drawGraphicsLayer.graphics.length > 0) {

                        var existingGraphic = this._drawGraphicsLayer.graphics[0];

                        // Test if new ring is intersecting previous rings
                        var deferred = esriConfig.defaults.geometryService.intersect([existingGraphic.geometry], geometry);
                        deferred.then(lang.hitch(this, function (geometries) {

                            // No intersections, OK!
                            if (geometries[0].rings.length === 0) {
                                existingGraphic.geometry.addRing(geometry.rings[0]);
                                geometry = existingGraphic.geometry;
                                this._drawGraphicsLayer.redraw();

                                this._refreshArea(geometry);
                                this._setGeometryParameter(geometry);
                            } else {
                                alert(this.nls.Toolbar.HasIntersections);
                            }

                            this._drawingEnabled = false;
                        }));

                        return;

                    } else {
                        var graphic = new Graphic(geometry, symbol);
                        this._drawGraphicsLayer.add(graphic);
                    }
                } else {
                    var graphic = new Graphic(geometry, symbol);
                    this._drawGraphicsLayer.add(graphic);
                }

                this._refreshArea(geometry);
                this._setGeometryParameter(geometry);

				this._drawingEnabled = false;

			},

			_refreshArea : function (geometry) {

				var areasAndLengthParams = new AreasAndLengthsParameters();
				areasAndLengthParams.lengthUnit = esriConfig.defaults.geometryService.UNIT_METERS;
				areasAndLengthParams.areaUnit = esriConfig.defaults.geometryService.UNIT_SQUARE_METERS;
				areasAndLengthParams.calculationType = 'preserveShape';
				areasAndLengthParams.polygons = [geometry];

				var deferred = esriConfig.defaults.geometryService.areasAndLengths(areasAndLengthParams);
				deferred.then(lang.hitch(this, function (evt) {
						this._drawnArea.innerHTML = lang.replace(this.nls.Toolbar.Area, {
								"area" : "<b>" + (evt.areas[0] / 10000).toLocaleString() + "</b>"
							});
					}));

				this._xmin.set('value', Math.round(geometry.getExtent().xmin));
				this._ymin.set('value', Math.round(geometry.getExtent().ymin));
				this._xmax.set('value', Math.round(geometry.getExtent().xmax));
				this._ymax.set('value', Math.round(geometry.getExtent().ymax));

			},

			_setGeometryParameter : function (geometry) {

				var processedGeometry;

				// esrijson
				if (this.options.settings.fme.geometry.format === "esrijson") {

					processedGeometry = JSON.stringify(geometry.toJson());
					this.emit("geometry-change", processedGeometry);

					return;
				}

				// WKT
				if (this.options.settings.fme.geometry.format === "wkt") {

                    var geographicGeometry = webMercatorUtils.webMercatorToGeographic(geometry);
                    var isMulti = geographicGeometry.rings.length > 1;

                    processedGeometry = isMulti ? "MULTIPOLYGON (" : "POLYGON (";

                    geographicGeometry.rings.forEach(function (ring) {
                        processedGeometry += isMulti ? "((" : "(";
                        for (var i = 0; i < ring.length; i++) {
                            processedGeometry += ring[i][0] + " " + ring[i][1] + ",";
                        }
                        processedGeometry = processedGeometry.substr(0, processedGeometry.length - 1);
                        processedGeometry += isMulti ? "))," : "),";
                    });

                    processedGeometry = processedGeometry.substr(0, processedGeometry.length - 1) + ")";

					this.emit("geometry-change", processedGeometry);
					return;
                }

                // geojson
                if (this.options.settings.fme.geometry.format === "geojson") {

                    var geographicGeometry = webMercatorUtils.webMercatorToGeographic(geometry);
                    var isMulti = geographicGeometry.rings.length > 1;

                    var geometry = {
                        "type": isMulti ? "MultiPolygon" : "Polygon",
                        "coordinates": []
                    };

                    geographicGeometry.rings.forEach(function (ring) {
                        if (isMulti) {
                            geometry.coordinates.push([ring]);
                        } else {
                            geometry.coordinates.push(ring);
                        }                       
                    });

                    processedGeometry = JSON.stringify(geometry);
                    this.emit("geometry-change", processedGeometry);
					return;

                }



			},

			postCreate : function () {
				this.inherited(arguments);

				this.own(
					on(this._drawPolygon, "click", lang.hitch(this, function () {
							this._startDrawing("POLYGON");
						})),
					on(this._drawExtent, "click", lang.hitch(this, function () {
							this._startDrawing("EXTENT");
                    })),
                    on(this._drawMulti, "change", lang.hitch(this, function () {
                        this._toolbar.deactivate();
                        this._editor.deactivate();
                    })),
					on(this._clearMap, "click", lang.hitch(this, function () {
							this._xmin.set('value', 0);
							this._ymin.set('value', 0);
							this._xmax.set('value', 0);
							this._ymax.set('value', 0);
							this._drawGraphicsLayer.clear();
							this._bufferGraphicsLayer.clear();
							this._jsonGeometry = null;
							this._drawnArea.innerHTML = "";
							this._toolbar.deactivate();
							this._editor.deactivate();
							this.emit("geometry-change");
						})),
					on(this._inputExtent, 'click', lang.hitch(this, function () {
							Utils.toggle(this._inputExtentArea.domNode);
							this._inputExtentArea.resize();
						})),
					on(this._drawInputExtent, 'click', lang.hitch(this, function () {

							if (this._inputForm.validate()) {
								var xmin = this._xmin.get('value');
								var ymin = this._ymin.get('value');
								var xmax = this._xmax.get('value');
								var ymax = this._ymax.get('value');

								if (xmin && ymin && xmax && ymax && (xmin < xmax) && (ymin < ymax)) {
									this._drawGraphicsLayer.clear();
									this._bufferGraphicsLayer.clear();
									var extent = new Extent({
											"xmin" : xmin,
											"ymin" : ymin,
											"xmax" : xmax,
											"ymax" : ymax,
											"spatialReference" : this.options.map.spatialReference
										});
									this._addToMap({
										geometry : extent
									});
									this.options.map.setExtent(extent.expand(1.2), true);
								} else {
									topic.publish("FMEPortal/alert", this.nls.Toolbar.InputExtent.Title, this.nls.Toolbar.InputExtent.InvalidCoordinates);
								}
							} else {
								topic.publish("FMEPortal/alert", this.nls.Toolbar.InputExtent.Title, this.nls.Toolbar.InputExtent.InvalidCoordinates);
							}
						})));

			},

			_startDrawing : function (tool) {
				this._xmin.set('value', 0);
				this._ymin.set('value', 0);
				this._xmax.set('value', 0);
                this._ymax.set('value', 0);

                // Only clear graphics if drawMulti is not checked
                if (!this._drawMulti.get('checked')) {
                    this._drawGraphicsLayer.clear();
                    this._bufferGraphicsLayer.clear();
                }

                this._toolbar.activate(Draw[tool]);
				this._drawingEnabled = true;
			},

			// Setup graphic right click menu, add buffer tool
			_createGraphicsToolsMenu : function () {
				this._graphicToolsMenu = new Menu({});
				var buffer = new Buffer({
						label : this.nls.Toolbar.Buffer.SetBuffer
					});
				this._graphicToolsMenu.addChild(buffer);
				this._graphicToolsMenu.startup();
			},

			destroy : function () {
				this.inherited(arguments);
			}

		});
	return Widget;
});
