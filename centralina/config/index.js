var fs = require('fs'),
    rootPath = require('path').dirname(require.main.filename);
    localAuth = JSON.parse(fs.readFileSync(rootPath+'/config/local.auth', 'utf8')),
    mailAuth = JSON.parse( fs.readFileSync('./config/mail.auth', 'utf8') ),
    wordpressAuth = JSON.parse( fs.readFileSync('./config/wordpress.auth', 'utf8') );


module.exports = {

    getLocalAuth: function() {
        return localAuth;
    },
    getMailAuth: function() {
        return mailAuth;
    },
    getWordpressAuth: function() {
        return wordpressAuth;
    }

}