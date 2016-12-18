/**
 * Example JSON-configuration
 */
define({
	"fme" : {
		"general" : {
			"id" : "portal-1", // Set a unique ID for the portal
			"title" : "FME Portal", // Portal title
			"about" : "About this FMEPortal..." // Visible in the about-popup
		},
		"server" : {
			"adminMode" : false, // Set portal to admin-mode
			"token" : {
				"token" : "568c604bc1f235bbe34563456345dfg", // Optional token
				"time" : 480, // Timeout for requested tokens
				"unit" : "minute", // Time unit for token requests
				"showTokenTab" : true, // Allow the visitor to login using a token
				"autoLogin" : false // If true - Use the supplied token to automatically sign in
			},
			"url" : "https://my-fme-server.com", // Url to FME-server
			"version" : "v2", // Supported REST-version is currently v2
			"showSettingsTab" : true // Allow the visitor to change server settings
		},
		"uploadSettings" : { // Disable selection of these file types in File Uploads
			"disabledFiles" : [".shx", ".prj", ".dbf", ".sbn", ".sbx", ".lock", ".png", ".xml", ".jpg", ".doc", ".docx", ".skp"]
		},
		"includedWorkspaces" : [// Only include these workspaces, requires adminMode = false
			{
				"title" : "WKTClip.fmw",
				"description" : "Description about the workspace WKTClip.fmw",
				"repository" : "REST-Playground",
				"workspace" : "WKTClip.fmw",
				"service" : "fmedatadownload"
			}
		],
		"customErrors" : { // Map error codes from workspace terminator transformers to error messages
			"101" : "No data in the area.",
			"102" : "Draw a smaller area to extract data..."
		},
		"geometry" : {
			"parameter" : "GEOM", // Workspace parameter for geometry
			"format" : "geojson" // esrijson or geojson
		},
	},
	"map" : {
		"drawColor" : [255, 170, 0, 0.75],
		"bufferColor" : [0, 0, 0, 0.25],
		"geometryService" : "https://tasks.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer"
	}
});
