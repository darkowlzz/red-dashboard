//modules and configs
//===============================================
var express = require('express'),
    router  = express.Router(),
    app     = express();

var port = process.env.port || 3000; //port set to 3000

//app specific configurations
//==================================================

app.use('/', express.static(__dirname + '/app/'));

//router configurations
//============================================

router.get('/', function (req, res) {
	res.render('/index.html');
});

app.use('/', router);

//run the server========================
var server = app.listen(port, function(){
	console.log('server has started running at localhost:' + port);
});
