define({
    root: {
        "Login": {
            "Tabs": {
                "Credentials": {
                    "Title": "Sign in",
                    "Info": "Sign in to access FME-server",
                    "Username": "Username",
                    "Password": "Password"
                },
                "Token": {
                    "Title": "Token sign in",
                    "Info": "Enter token to sign in to FME-server",
                    "Token": "Valid token"
                },
                "Settings": {
                    "Title": "Settings",
                    "Info": "Setup FME-server information",
                    "ServerUrl": "FME-server URL",
                    "AdminMode": {
                        "Info": "Start the portal in admin mode to automatically retrieve all repositorys and workspaces the active user has access too.",
                        "Label": "Use admin mode"
                    }
                }
            },
            "SignedInAs": "You are signed in as ",
            "TokenSignIn": "You are signed in using a token",
            "Button": "Sign in",
            "ButtonSignout": "Sign out",
            "Messages": {
                "Expired": "Your session expired, sign in again!",
                "BadLogin": "Bad login, wrong username or password?",
                "NoAccess": "Cant access the FME-server at {url}",
                "NoPermission": "You don't have permission to access this FME-server.",
                "NoWorkspacePermission": "You don't have permission to access this workspace.",
                "BadToken": "Invalid token or server settings."
            }
        },
        "Widget": {
            "About": "About",
            "Step1": {
                "Title": "Step 1: Draw clipping area"
            },
            "Step2": {
                "Title": "Step 2: Select workspace, set parameters and run!",
                "LoadingParams": "Loading parameters...",
                "LoadingContent": "Loading content...",
                "ChooseWorkspace": "Choose Workspace",
                "Repository": "Repository",
                "Workspace":"Workspace"
            },
            "Step3": {
                "Title": "Step 3: Results",
                "LoadingResult": "Waiting for workspace results...",
                "ClearResult": "Clear",
                "NoTranslationResults": "No translation results yet..."
            }
        },
        "GenerateForms": {
            "NumberTextBox": {
                "IntegerMessage": "The value must be integer",
                "NumberMessage": "The value must be a number",
                "MinMaxMessage": "Input a number between {min} and {max}",
                "MinMaxPlaceholder": "min {min}, max {max}"
            },
            "ColorPicker": {
                "SelectColor": "Select a color"
            },
            "Results": {
                "Success": "Translation Successful",
                "Download": "Download results...",
                "Count": "written features",
                "ViewStreamingResult": "View data streaming results"
            },
            "ButtonOrder": "Run",
            "Error": {
                "ServiceType": "Service type {type} is not supported.",
                "Unknown": "Unknown error!",
                "No output dataset": "No output dataset was produced by FME transformation",
                "Fatal error": "A fatal error occured",
                "Missing geometry": "A geometry is missing",
                "Transformation failed": "The transformation failed",
                "Unauthorized request": "Unauthorized request",
                "No transformation result": "No transformation result"
            }
        },
        "FileUpload": {
            "AddFiles": "Add file(s)",
            "SelectFiles": "Select file(s)",
            "SelectTranslationFiles": "Select file(s) for the translation",
            "Button": "Upload file(s)",
            "Uploading": "Uploading file(s)...",
            "NoFiles": "No uploaded file(s)",
            "FileList": {
                "Name": "Name",
                "Size": "Size",
                "Type": "Type"
            }
        },
        "WorkspaceInfo": {
            "ButtonLabel": "Workspace Information",
            "Label": "Workspace information about",
            "Title": "Title",
            "Build": "FME Build number",
            "Filesize": "File Size",
            "Category": "Category",
            "Description": "Description",
            "History": "History",
            "LastSaveBuild": "FME last save build number",
            "LastSaveDate": "FME last save date",
            "Resources": "File resources",
            "Services": "Registered services",
            "Type": "Type of resource",
            "Usage": "Usage info"
        },
        "Status": {
            "Title": "FME-server status",
            "RunningJobs": "Running jobs",
            "NoRunningJobs": "No running jobs.",
            "QueuedJobs": "Queued jobs",
            "NoQueuedJobs": "No queued jobs."
        },
        "Toolbar": {
            "NoMap": "This portal is not connected to a map.",
            "Message": "Select a workspace to enable drawing tools.",
            "Area": "The drawing cover {area} hectares.",
            "Edit": "Click somewhere outside the edited geometry to save it.",
            "InputExtent": {
                "Title": "Input extent coordinates",
                "Input": "Input",
                "xmin": "x-min",
                "ymin": "y-min",
                "xmax": "x-max",
                "ymax": "y-max",
                "Validation": {
                    "Coordinates": "Input valid coordinates"
                },
                "ButtonDraw": "Draw extent",
                "InvalidCoordinates": "Invalid coordinates!"
            },
            "Buffer": {
                "UseBuffer": "Set",
                "SetBuffer": "Set buffer"
            }
        }
    },
    "sv": true
}); 