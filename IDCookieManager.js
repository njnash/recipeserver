var console = require('console');
var https = require('https');
var fs = require('fs');

// Constructor
function IDCookieManager(dataDir)
{
  this.cookieFile = dataDir + '/cookies.json';
  this.readCookies();
}

IDCookieManager.prototype.readCookies = function()
{
  console.log('Loading cookes from ' + this.cookieFile);
  this.cookies = [];
  var data;
  try {
    data = fs.readFileSync(this.cookieFile);
  } catch (e) {
    data = null;
  }
  if (data != null) {
    this.cookies = JSON.parse(data);
  }
}

// Permissions: -1=not found, 0=none, 1=normal, 2=admin
IDCookieManager.prototype.addCookie = function(newCookie,permission)
{
  this.cookies.push({cookie:newCookie, permissions:permission})
  fs.writeFile(this.cookieFile, JSON.stringify(this.cookies, null, 2));
}

IDCookieManager.prototype.isCookeValid = function(newCookie)
{
  for (i=0;i<this.cookies.length;i++) {
    if (this.cookies[i].cookie == newCookie) return this.cookies[i].permissions;
  }
  return -1;
}


// export the class
module.exports = IDCookieManager;
