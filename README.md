# dojo-fmeserver-portal
The municipality of Gävles FME portal - A configurable webb portal 
developed using ESRI:s JavaScript API, Dojo Toolkit and FMEServer.js.
The portal is a Dojo widget that can be integrated in a mapping 
application. The purpose of the widget is to allow 
quick setup of customized portals for easy access to
FME workspaces stored on FME-server.

**Features:**
- Authentication using credentials or tokens, auto-sign-in option
- Two "portal modes", admin or custom mode.
- Most FME parameter types are supported and represented as dijit form widgets.
- File Upload forms.
- Map and drawing tools for managing clipping geometries, right-click to apply buffer.
- Simple JSON configuration.
- Internationalization (en, sv).
- Supports FME-server service types Data Download, Job Submitter and Data Streaming.
- Access workspace metadata and see running and queued jobs on FME-server

<img src="app-0.png" style="width:100%;max-width:800px;">

## Table of Contents

- Examples
- Usage
- Configuration
   - Server
   - Uploads
   - Included Workspaces
   - Custom error messages
   - Geometry
   - Map
- Internationalization
- History
- Credits
- License

## Examples
**The examples are connected to a **[Safe Software](https://www.safe.com)** demo FME-server.**

**[Demo 1 - Automatic sign-in using a token, 4 workspaces configured](https://gis.gavle.se/pubs/fmeportal/examples/demo2.html)**

**[Demo 2 - Authenticate using a token or credentials with possibility to change server url and admin-mode](https://gis.gavle.se/pubs/fmeportal/examples/demo1.html)**

## Usage

Setup a package pointing to the widget location in the dojoConfig. There is an optimized built version of the widget in the **dist** folder.

Include ESRI:s JavaScript API and FME-Server JavaScript Library. Remember to set dojoConfig before loading Dojo.

**The FME-Server JavaScript library included in this repo has been slightly modified to support multiple file uploads and to better support international characters.**


     <script>
        var dojoConfig = {
           async: true,
           packages: [
              {
              'name': 'app',
              'location': location.protocol + "//" + location.host + "/src/app"
              }
           ]
       };
    </script>
    <script src="https://js.arcgis.com/3.18/"></script>
    <script src="../src/lib/FMEServer.js"></script>


Initialize the FMEPortal widget by passing a map (optional) and a configuration object as the first argument and a DOM-node or a DOM id as the second.

Example: 

    <script>
	    require([
            "app/FMEPortal",
            "esri/map"
        ], function (FMEPortal, Map) {

            var map = new Map("map", {
                basemap: "topo",
                center: [ -123.114166, 49.264549 ],
                zoom: 12,
                minZoom: 12
            });

            var fmeportal = new FMEPortal({
                "settings": configuration,
                "map": map
            }, "fmeportal");
        });
    </script>

## Configuration
For a full configuration example, see **src/app/FMEPortal/Config**.

### General

Set a unique id for the portal, a title and the about popup contents. The id is used to remember token and server settings in the browsers localStorage on refresh.

    "general": {
        "id": "portal-1",
        "title": "FME Portal",
        "about": "About this FMEPortal..."
    }

### Server

The server section of the configuration controls the portal mode, authentication options, FME-server url and API-version.

Example:

        { 
           "server": {
               "adminMode": false,
               "token": {
                  "token": "568c604bc1f235bbe137c514e7c61a8436043070",
                  "time": 480,
                  "unit": "minute",
                  "showTokenTab": true,
                  "autoLogin": false
               },
               "url": "https://demos-safe-software.fmecloud.com",
               "version": "v2",
               "showSettingsTab": true
        }


#### adminMode
True/False

If adminMode is enabled, the portal will query FME-server for all repositorys and workspaces the authenticated user has access too and populate two dropdowns.
<img src="admin-mode-0.png" width="350">

Additionally, workspace forms will have two extra options next to the Run button:
 - A service type selector allowing the user to run a workspace using a specific registered service 
 - A button to show metadata about the workspace.
<img src="admin-mode-1.png" width="350">

If adminMode is disabled, specific workspaces to include in the portal must be set using the **includedWorkspaces** option.

#### token
 - **token** - Default token (optional)
 - **time** - Token lifespan
 - **unit** - Token lifespan unit
 - **showTokenTab** - True/False - Allow the user to sign in using a token
 - **autoLogin** - True/False - Use the supplied **token** to automatically sign in the visitor.

#### url
The FME-server base url.

#### version
The API version, currently only **v2** supported.

#### showSettingsTab
True/False

Allow the visitor to change server **url** and set **adminMode** before signing in.

### Uploads
Disable selection of specific filetypes for upload to FME-server.

Example:

    "uploadSettings": { 
       "disabledFiles": [".shx", ".prj", ".dbf", ".sbn", ".sbx", ".lock", ".png", ".xml", ".jpg", ".doc", ".docx", ".skp"]
    }

### Include workspaces

Array of workspaces to include in the portal, each item must have:

  - **title** - The workspace title.
  - **description** - Description of the workspace. Visible when the user clicks the question mark.
  - **repository** - Name of the FME-server repository.
  - **workspace** - Name of the FME-server workspace (including *.fmw)
  - **service** - The registered service type to use when running the workspace, "fmedatadownload", "fmejobsubmitter" and "fmedatastreaming" are supported.

<img src="include-workspaces-0.png" width="350">

Example:

    "includedWorkspaces": [
        {
            "title": "WKT Clip",
            "description": "Description of the WKT Clip workspace.",
            "repository": "REST-Playground",
            "workspace": "WKTClip.fmw",
            "service": "fmedatadownload"
        },{
            "title": "Austin Transport example",
            "description": "Description of the Austin Transport workspace.",
            "repository": "REST-Playground",
            "workspace": "AustinTransport.fmw",
            "service": "fmedatastreaming"
        }
    ]

### Custom error messages

Map error codes reported from FME Terminator transformers to specific error messages.

This can be useful for sending back messages from a workspace when something is wrong and a terminator is triggered.

Example:

     "customErrors": {
         "101": "No data in the area.",
         "102": "Draw a smaller area to extract data...",
         "103": "You don't have permission to extract data in the area"
      }

### Geometry
Drawing tools will automatically appear when a selected workspace have a parameter name defined in the geometry section. The drawn geometry will be passed to the server as a string in the specified format. A map is required.

  - **parameter** - The name of the workspace parameter that is used to send a clipping geometry to the server
  - **format** - The geometry-format that is sent to the server, **geojson** or **esrijson** are supported.

Example:

    "geometry": {
        "parameter": "GEOM",
        "format": "geojson"
    }

### Map
If a map is used, these settings are required.

  - **drawColor** - The color used for map drawings (rgba).
  - **bufferColor** - The color used for the original geometry when a buffer is applied (right click on a geometry) (rgba).
  - **geometryService** - An ArcGIS Server geometry service used to buffer geometry and calculate areas and lengths.

Example:

    "map": {
        "drawColor": [255, 170, 0, 0.75],
        "bufferColor": [0, 0, 0, 0.25],
        "geometryService": "https://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer"
    }

## Internationalization
The widget is internationalized in English, **en**, (default) and Swedish, **sv**. see the **FMEPortal/nls** folder.

More on Dojo internationalization here: https://dojotoolkit.org/documentation/tutorials/1.10/i18n/.


## History
2016-12-18 - v1.0 First release
## Credits
dojo-fmeserver-portal was developed by Peter Jäderkvist at Community Development Gävle.
## License
dojo-fmeserver-portal is released under the MIT license.