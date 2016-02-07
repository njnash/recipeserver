var express = require('express');
var nodemailer = require('nodemailer');
var getter = express.Router();
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://rvnash%40gmail.com:roislgbbmavxtjqt@smtp.gmail.com');

getter.get('/',
  function(req, res, next) {

    var title = req.query.title;
    var id = null;
    if (title == null) {
      id = req.query.ID;
    } else {
      results = global.rm.textSearch(null,title,'Title');
      if (results != null && results.length == 1) {
        id = results[0].ID;
      }
    }
    if (id == null) {
      res.render('error', {
        message: 'No ID given',
        error: {}
      });
    } else {
      var recipe = global.rm.getRecipeByID(id);
      if (recipe == null) {
        res.render('error', {
          message: 'No recipe with the ID\'' + id + '\'',
          error: {}
        });
      } else {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: 'Recipe Server <server@audreysgreatbigbookoffood.com>', // sender address
            to: 'comments@audreysgreatbigbookoffood.com', // list of receivers
            subject: 'Comment on: ' + recipe.Title, // Subject line
            text: 'From user with cookie: ' + req.cookies.ID + '\n'
                  + 'Name or email address: ' + req.query.name + '\n'
                  + 'Text of Comment:\n' + req.query.comment // plaintext body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
        res.render('sendcomment',
                    {
                      recipe:recipe,
                      id:id,
                      pretty:true
                    }
                  );
      }
    }
  }
);

module.exports = getter;
