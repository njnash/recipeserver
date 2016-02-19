# Recipe Server #

### How do I get set up? ###

* sudo apt-get install nodejs
* sudo apt-get install npm
* Install packages using npm
    * npm install express serve-favicon babyparse morgan cookie-parser body-parser debug jade file-stream-rotator nodemailer googleapis google-auth-library

To configure server to run automatically on the server:
* Copy the file in this directory called "recipe.conf" to /etc/initd
* Edit the user name and directory location of the server in that file
* Restart the server, and the recipe server should be running

To control server on toshiba-1
  stop recipe
  restart recipe
  start recipe

TODO: Describe how to create a recipe spreadsheet, give a sample, and tricks for formatting characters.

TODO: Describe how to get photos to work
