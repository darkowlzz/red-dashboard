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
  id: { type: Number },
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
  id: { type: Number },
  done: { type: Boolean }
});
var Donor = mongoose.model('donors', donorSchema);

var campSchema = new mongoose.Schema({
  title: { type: String },
  location: { type: String },
  date: { type: Date },
  organizer: { type: String },
  contact: { type: String },
  id: { type: Number },
  modifiedOn: { type: Date },
  done: { type: Boolean }
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

// Render index.html
router.get('/', function (req, res) {
	res.render('/index.html');
});

// Get blood request data
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

// Get pending blood requests
router.get('/bloodreqs/pending', function (req, res) {
  BloodReq.find({done: false}).exec(function (err, result) {
    if (!err) {
      res.json(result);
    } else {
      console.log('Error retrieving data');
      res.json({ Error: 'failed to retrieve data' });
    }
  });
});

// Get blood donors data
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

// Get camps data
router.get('/camps', function (req, res) {
  Camp.find({}).exec(function (err, result) {
    if (!err) {
      res.json(result);
    } else {
      console.log('Error retrieving data');
      res.json({ Error: 'failed to retrieve data' });
    }
  });
});

// Change blood request 'done' status
router.post('/request/done', function (req, res) {
  BloodReq.findOne({ id: req.body.data.id }, function (err, aReq) {
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

// Change blood donor 'done' status
router.post('/donor/done', function (req, res) {
  Donor.findOne({ id: req.body.data.id }, function (err, aDon) {
    // set done value
    aDon.done = req.body.done;
    aDon.save(function (err, obj) {
      if (err) {
        console.log('error updating donor');
        res.json({error: true});
      } else {
        res.json(obj);
      }
    });
  });
});

// Change camp 'done' status
router.post('/camp/done', function (req, res) {
  Camp.findOne({ id: req.body.data.id }, function (err, aCamp) {
    aCamp.done = req.body.done;
    aCamp.save(function (err, obj) {
      if (err) {
        console.log('error updating camp');
        res.json({error: true});
      } else {
        res.json(obj);
      }
    });
  });
});

// Post and create new camp
router.post('/camp/new', function (req, res) {
  var data = req.body;
  console.log('date is', JSON.stringify(data.date));
  var aCamp = new Camp({
    title: data.title || '',
    location: data.location || '',
    date: new Date(data.date.year, data.date.month - 1, data.date.day) ||
          new Date,
    organizer: data.organizer || '',
    contact: data.contact || '',
    modifiedOn: new Date,
    done: false
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

// get total blood requests count
router.get('/stats/bloodreqs', function (req, res) {
  BloodReq.find({}).count().exec(function (err, count) {
    res.json({ count: count });
  });
});

// get blood requests done count
router.get('/stats/bloodreqs/done', function (req, res) {
  BloodReq.find({done: true}).count().exec(function (err, count) {
    res.json({ count: count });
  });
});

// get total donors count
router.get('/stats/donors', function (req, res) {
  Donor.find({}).count().exec(function (err, count) {
    res.json({ count: count });
  });
});

// get donors done count
router.get('/stats/donors/done', function (req, res) {
  Donor.find({done: true}).count().exec(function (err, count) {
    res.json({ count: count });
  });
});

// get total camps count
router.get('/stats/camps', function (req, res) {
  Donor.find({}).count().exec(function (err, count) {
    res.json({ count: count });
  });
});

// get camps done count
router.get('/stats/camps/done', function (req, res) {
  Camp.find({done: true}).count().exec(function (err, count) {
    res.json({ count: count });
  });
});

app.use('/', router);


//run the server========================
var server = app.listen(port, function(){
	console.log('server has started running at localhost:' + port);
});
