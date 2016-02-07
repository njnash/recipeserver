var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var fs = require('fs');
var util = require("util");
var path = require('path');

var syncDirectory=path.join(__dirname,'public/images/Pictures/');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
		 process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'RecipeManager.json';
var drive;
var globalAuth;

function synchWithGoogle()
{
	console.log("Starting sync with google images at " + new Date());
	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		if (err) {
		    console.log('Error loading client secret file: ' + err);
		    return;
		}
		// Authorize a client with the loaded credentials, then call the
		// Drive API.
		authorize(JSON.parse(content), listFiles);
	    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
	    if (err) {
		getNewToken(oauth2Client, callback);
	    } else {
		oauth2Client.credentials = JSON.parse(token);
		callback(oauth2Client);
	    }
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
	    access_type: 'offline',
	    scope: SCOPES
	});
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
	    input: process.stdin,
	    output: process.stdout
	});
    rl.question('Enter the code from that page here: ', function(code) {
	    rl.close();
	    oauth2Client.getToken(code, function(err, token) {
		    if (err) {
			console.log('Error while trying to retrieve access token', err);
			return;
		    }
		    oauth2Client.credentials = token;
		    storeToken(token);
		    callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
	fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
	if (err.code != 'EEXIST') {
	    throw err;
	}
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

function deleteLocal(g)
{
	var localFile = syncDirectory + "/" + g.name;
	fs.unlink(localFile);
}

function updateFromGoogle(g)
{
	var localFile = syncDirectory + "/" + g.name;
	var dest = fs.createWriteStream(localFile);
	console.log("Downloading: " + localFile);
	drive.files.get({
							 auth:globalAuth,
						   fileId: g.id,
						   alt: 'media'
						})
						.on('end', function() {
						  //console.log('Downloaded: ' + g.name);
						})
						.on('error', function(err) {
						  console.log('Error during download', err);
							downloaded = true;
						}).pipe(dest);
}

function executeDeletes( whatToDo )
{
	while (whatToDo.length > 0) {
		var action = whatToDo[0];
		whatToDo.splice(0,1);
		console.log("Deleting local file: " + action.l.name);
		deleteLocal(action.l);
	}
}

function executeFileGets( whatToDo )
{
	if (whatToDo.length == 0) return;
	var thisInterval = setInterval(function() {
		var action = whatToDo[0];
		whatToDo.splice(0,1);
		updateFromGoogle(action.g);
		if (whatToDo.length == 0) {
			clearInterval(thisInterval);
		}
	}, 1000);
}

function gotGoogleAndlocalfiles( googlefiles, localfiles )
{
	var onGoogle=0, onLocal=0;

	var deletes = [];
	var gets = [];
	while (onGoogle < googlefiles.length || onLocal < localfiles.length) {
		// If the next file on both have the same name, compare them for update
		var g = googlefiles[onGoogle];
		var l = localfiles[onLocal];
		if (g == null || l == null || g.name != l.name) {
			// Different names or ran out on one side or the other
			if ((l != null) && (g == null || g.name > l.name)) {
				// It appears the local file is missing from google, so delete it
				console.log("C: " + (g != null ? g.name : "null") + " " + (l != null ? l.name : "null"));
				console.log("Google name is after local so, delete local");
				deletes.push({action:'delete', l:l});
				onLocal++;
			} else {
				// It appears the google file is missing from local, so copy it here
				console.log("C: " + (g != null ? g.name : "null") + " " + (l != null ? l.name : "null"));
				console.log("Google name is before local so, copy to local");
				gets.push({action:'copy', g:g});
				onGoogle++;
			}
		} else {
			var diff = g.modifiedTime.valueOf() - l.modifiedTime.valueOf();
			if (diff > 30 * 1000) { // must be more than a 30 second difference to count
				console.log("C: " + (g != null ? g.name : "null") + " " + (l != null ? l.name : "null"));
				console.log("Google date after " + g.modifiedTime + "   " + l.modifiedTime);
				gets.push({action:'update', g:g, l:l});
			}
			if (g.size != l.size) {
				console.log("C: " + (g != null ? g.name : "null") + " " + (l != null ? l.name : "null"));
				console.log("Size wrong, update");
				gets.push({action:'update', g:g, l:l});
			}
			onGoogle++;
			onLocal++;
		}
	}
	executeDeletes(deletes);
	executeFileGets(gets);
}


function googleFilesReturned(err, response)
{
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		var googlefiles = response.files;
		if (googlefiles.length == 0) {
		} else {
			for (var i = 0; i < googlefiles.length; i++) {
				var file = googlefiles[i];
				file.modifiedTime = new Date(file.modifiedTime);
//				console.log('%s %s %s (%s)', file.name, file.modifiedTime, file.size, file.id);
			}
			var localfiles = [];
			fs.readdir(syncDirectory,function(err, files) {
					if (err) {
						console.log('Error: ' + syncDirectory + ", " + err);
					} else {
						for (var i = 0; i < files.length; i++) {
							var fname = syncDirectory + "/" + files[i];
							var file = {name:files[i]};
							var stats = fs.statSync(fname);
							file.size = stats.size;
							file.modifiedTime = new Date(stats.mtime);
							localfiles.push(file);
						}
						localfiles.sort(function(a,b) {
				                       if (a.name > b.name) return 1;
				                       if (a.name < b.name) return -1;
				                       return 0;
				                     });
					   googlefiles.sort(function(a,b) {
				                       if (a.name > b.name) return 1;
				                       if (a.name < b.name) return -1;
				                       return 0;
				                     });
						gotGoogleAndlocalfiles( googlefiles, localfiles );
					}
			});
	}
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
	  globalAuth = auth;
    drive = google.drive('v3');
    drive.files.list( {
	    auth: auth,
			orderBy: "name",
			q: "'0B6xAIFFnWNaEfnhuTWFiNmZJUXl5c1VMSnlmb1AyYkRORnQzR0IyWC1MYnd1amVmYVAtUlk' in parents and trashed=false", // Pictures in Audreys Great Big Book of Food foleder
			pageSize: 1000,
			fields: "nextPageToken, files(id,modifiedTime,name,size)"
		}, googleFilesReturned
		);
}

console.log("SYNC DIR: " + syncDirectory);
synchWithGoogle();
setInterval( synchWithGoogle, 1000 * 60 * 5 ); // Every 5 minutes
