//modules and configs
//===============================================
var express = require('express'),
    router  = express.Router(),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var port = process.env.PORT || 3000; //port set to 3000

var uristring = process.env.MONGODB_URI ||
                'mongodb://stepindia:step000india@ds047008.mongolab.com:47008/step';

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('Error connecting to db');
  } else {
    console.log('Succeeded in connecting to db');
  }
});

var reqSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  group: { type: String },
  quantity: { type: Number },
  reqOn: { type: String }
});
var BloodReq = mongoose.model('bloodreqs', reqSchema);

var donorSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  group: { type: String }
});
var Donor = mongoose.model('donors', donorSchema);

//app specific configurations
//==================================================

app.use('/', express.static(__dirname + '/app/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//router configurations
//============================================

router.get('/', function (req, res) {
	res.render('/index.html');
});

router.get('/bloodreqs', function (req, res) {
  console.log('got a request for bloodreqs');
  BloodReq.find({}).exec(function (err, result) {
    if (!err) {
      console.log('got', result);
      res.json(result);
    } else {
      console.log('Error retrieving data');
      res.json({ Error: 'failed to retrieve data' });
    }
  });
});

router.get('/donors', function (req, res) {
  Donor.find({}).exec(function (err, result) {
    if (!err) {
      res.json(result);
    } else {
      console.log('Error retrieving data');
      res.json({ Error: 'failed to retrieve data' });
    }
  });
});

app.use('/', router);

//run the server========================
var server = app.listen(port, function(){
	console.log('server has started running at localhost:' + port);
});
