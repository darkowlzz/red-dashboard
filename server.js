//modules and configs
//===============================================
var express = require('express'),
    router  = express.Router(),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var port = process.env.PORT || 3000; //port set to 3000

var uristring = process.env.MONGODB_URI || 'mongodb://localhost/step';

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
  reqOn: { type: String },
  reqId: { type: Number },
  done: { type: Boolean }
});
var BloodReq = mongoose.model('bloodreqs', reqSchema);

var donorSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  group: { type: String },
  donId: { type: Number },
  done: { type: Boolean }
});
var Donor = mongoose.model('donors', donorSchema);

var campSchema = new mongoose.Schema({
  title: { type: String },
  location: { type: String },
  date: { type: String },
  organizer: { type: String },
  contact: { type: String },
  id: { type: Number }
});
var Camp = mongoose.model('camps', campSchema);

var statusSchema = new mongoose.Schema({
  name: { type: String },
  count: { type: Number }
});
var Status = mongoose.model('status', statusSchema);

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
  BloodReq.find({}).exec(function (err, result) {
    if (!err) {
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

router.post('/request/done', function (req, res) {
  BloodReq.findOne({reqId: req.body.data.reqId }, function (err, aReq) {
    // set done value
    aReq.done = req.body.done;
    aReq.save(function (err, obj) {
      if (err) {
        console.log('error updating blood request');
        res.json({error: true});
      } else {
        res.json(obj);
      }
    });
  });
});

router.post('/donor/done', function (req, res) {
  Donor.findOne({donId: req.body.data.donId }, function (err, aDon) {
    // set done value
    aDon.done = req.body.done;
    aDon.save(function (err, obj) {
      if (err) {
        console.log('error updating blood request');
        res.json({error: true});
      } else {
        res.json(obj);
      }
    });
  });
});

router.post('/camp/new', function (req, res) {
  console.log('received', req.body);
  var aCamp = new Camp({
    title: req.body.title || '',
    location: req.body.location || '',
    date: req.body.date || '',
    organizer: req.body.organizer || '',
    contact: req.body.contact || ''
  });

  Status.findOne({name: 'camps'}, function (err, stat) {
    aCamp.id = stat.count + 1;
    stat.count = aCamp.id;
    stat.save(function (err) {
      if (err) {
        console.log('error in updating');
      } else {
        aCamp.save(function (err, obj) {
          if (err) {
            console.log('Error on save!');
          } else {
            console.log('Saving', obj);
            res.json(obj);
          }
        });
      }
    });
  });
});

app.use('/', router);

//run the server========================
var server = app.listen(port, function(){
	console.log('server has started running at localhost:' + port);
});
