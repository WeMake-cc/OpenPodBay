var u = require('./utils.js');

u.getLogger();

var webpanel = require('./webpanel')(),
    portWebpanel = process.env.PORT || 5000;

var server = webpanel.listen(portWebpanel, function() {
    console.log('Listening on port %d', server.address().port);
});

// TODO: will be a module with a class
var fs = require('fs');
var pingGoogle = function() {
    //console.log('ping google ');

    var sys = require('sys');
    var exec = require('child_process').exec;
    exec("ping -c 1 localhost", function(error, stdout, stderr) {
        
        // hand made ping stdout parser
        var t = ''+stdout.split('\n')[1].split(' ')[6].split('=')[1];

        u.getLogger().network('PING: '+t);
    });
}
setInterval(pingGoogle, 1000*60);

u.sendMail({
    subject: "[Pot bay door] start",
    text: u.getNowPrettyPrint() + " restart server"
});