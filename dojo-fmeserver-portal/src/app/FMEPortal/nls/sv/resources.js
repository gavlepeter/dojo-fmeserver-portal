define({
	"Login" : {
		"Tabs" : {
			"Credentials" : {
				"Title" : "Logga in",
				"Info" : "Logga in för att komma åt FME-server",
				"Username" : "Användarnamn",
				"Password" : "Lösenord"
			},
			"Token" : {
				"Title" : "Logga in med token",
				"Info" : "Ange token för att logga in till FME-server",
				"Token" : "Giltig token"
			},
			"Settings" : {
				"Title" : "Inställningar",
				"Info" : "Ställ in FME-server info",
				"ServerUrl" : "FME-server url",
				"AdminMode" : {
					"Info" : "Starta i administratörsläge för att automatiskt hämta alla kataloger och skript som den aktiva användaren har åtkomst till.",
					"Label" : "Använd administratörsläge"
				}
			}
		},
		"SignedInAs" : "Du är inloggad som ",
		"TokenSignIn" : "Du har loggat med en token",
		"Button" : "Logga in",
		"ButtonSignout" : "Logga ut",
		"Messages" : {
			"Expired" : "Din session har gått ut, logga in på nytt!",
			"BadLogin" : "Felaktig inloggning, fel användarnamn eller lösenord?",
			"NoAccess" : "Kan inte komma FME-servern på {url}",
			"NoPermission" : "Du har ingen behörighet på denna FME-server.",
			"NoWorkspacePermission" : "Du har inte behörighet till detta FME-skript.",
			"BadToken" : "Felaktig token eller server-inställning."
		}
	},
	"Widget" : {
		"About" : "Om",
		"Step1" : {
			"Title" : "Steg 1: Rita en klippyta"
		},
		"Step2" : {
			"Title" : "Steg 2: Välj FME-skript, ställ in parametrar och kör!",
			"LoadingParams" : "Laddar formulär...",
			"LoadingContent" : "Laddar innehåll...",
			"ChooseWorkspace" : "Välj FME-skript",
			"Repository" : "Katalog",
			"Workspace" : "FME-skript"
		},
		"Step3" : {
			"Title" : "Steg 3: Resultat",
			"LoadingResult" : "Inväntar resultat...",
			"ClearResult" : "Rensa",
			"NoTranslationResults" : "Inga resultat ännu..."
		}
	},
	"GenerateForms" : {
		"NumberTextBox" : {
			"IntegerMessage" : "Värdet måste vara ett heltal.",
			"NumberMessage" : "Värdet måste vara ett tal.",
			"MinMaxMessage" : "Ange ett värde mellan {min} och {max}",
			"MinMaxPlaceholder" : "min {min}, max {max}"
		},
		"ColorPicker" : {
			"SelectColor" : "Välj en färg"
		},
		"Results" : {
			"Success" : "Körningen lyckades!",
			"Download" : "Ladda ned resultatet",
			"Count" : "Skrivna objekt/poster",
            "ViewStreamingResult": "Visa resultat från data streaming-tjänsten",
            "Email": "Ditt jobb med ID <b>{jobID}</b> har skickats till FME-server. Resultatet kommer att skickas till <b>{email}</b>."
		},
		"ButtonOrder" : "Kör",
		"Error" : {
			"ServiceType" : "Servicetypen {type} stöds inte.",
			"Unknown" : "Okänd fel!",
			"No output dataset" : "Inget utdata skapades vid FME-körningen.",
			"Fatal error" : "Ett allvarligt fel inträffade",
			"Missing geometry" : "En geometri saknas",
			"Transformation failed" : "Något gick fel vid körningen",
			"Unauthorized request" : "Obehörigt anrop",
			"No transformation result" : "Körningen gav inget resultat."
        },
        "EmailResults": "Maila resultatet",
        "EmailPlaceholder": "Ange e-post"
	},
	"FileUpload" : {
		"AddFiles" : "Lägg till fil(er)",
		"SelectFiles" : "Välj fil(er)",
		"SelectTranslationFiles" : "Välj fil(er) till FME-skriptet",
		"Button" : "Ladda upp fil(er)",
		"Uploading" : "Laddar upp fil(er)...",
		"NoFiles" : "Inga uppladdade fil(er)",
		"FileList" : {
			"Name" : "Namn",
			"Size" : "Storlek",
			"Type" : "Typ"
		}
	},
	"WorkspaceInfo" : {
		"ButtonLabel" : "Information om FME-skriptet",
		"Label" : "Information om FME-skriptet ",
		"Title" : "Titel",
		"Build" : "FME Build version",
		"Filesize" : "Filstorlek",
		"Category" : "Kategori",
		"Description" : "Beskrivning",
		"History" : "Historik",
		"LastSaveBuild" : "Senast sparad med FME build version",
		"LastSaveDate" : "Senast sparad",
		"Resources" : "Filresurser",
		"Services" : "Registrerade tjänster",
		"Type" : "Typ av resurs",
		"Usage" : "Information om användning"
	},
	"Status" : {
		"Title" : "FME-server status",
		"RunningJobs" : "Pågående jobb",
		"NoRunningJobs" : "Inga pågående jobb.",
		"QueuedJobs" : "Jobb i kö",
		"NoQueuedJobs" : "Inga jobb i kö."
	},
	"Toolbar" : {
		"NoMap" : "Portalen är inte kopplad till en karta.",
		"Message" : "Välj ett FME-skript för att aktivera ritverktyg.",
		"Area" : "Ritningen täcker {area} hektar.",
		"Edit": "Klicka utanför den ändrade ytan för att spara.",
        "Coordinates": "Koordinater",
        "DrawMultiple": "Rita flera klippytor",
        "HasIntersections": "Överlappande klippytor tillåts inte.",
		"InputExtent" : {
			"Title" : "Ange utbredningskoordinater",
			"Input" : "Ange",
			"xmin" : "x-min",
			"ymin" : "y-min",
			"xmax" : "x-max",
			"ymax" : "y-max",
			"Validation" : {
				"Coordinates" : "Ange giltiga koordinater"
			},
			"ButtonDraw" : "Rita utbredning",
			"InvalidCoordinates" : "Ogiltiga koordinater!"
		},
		"Buffer" : {
			"UseBuffer" : "Ange",
			"SetBuffer" : "Ange buffert"
		}
	}
});
