//modules and configs
//===============================================
var express = require('express'),
    router  = express.Router(),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var port = process.env.PORT || 3000; //port set to 3000

var uristring = process.env.MONGODB_URI || 'mongodb://localhost/step';

//database connection and schema
//===============================================

// Connect to db
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('Error connecting to db');
  } else {
    console.log('Succeeded in connecting to db');
  }
});

// Blood Request Schema
var reqSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  group: { type: String },
  quantity: { type: Number },
  reqOn: { type: Date },
  id: { type: Number },
  done: { type: Boolean }
});
var BloodReq = mongoose.model('bloodreqs', reqSchema);

// Blood Donor Schema
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

// Camp Schema
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

// Status Schema
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
  query({}, 'request', res);
});

// Get pending blood requests
router.get('/bloodreqs/pending', function (req, res) {
  query({done: false}, 'request', res);
});

// Get blood donors data
router.get('/donors', function (req, res) {
  query({}, 'donor', res);
});

// Get pending blood donors
router.get('/donors/pending', function (req, res) {
  query({done: false}, 'donor', res);
});

// Get camps data
router.get('/camps', function (req, res) {
  query({}, 'camp', res);
});

// Get pending camps
router.get('/camps/pending', function (req, res) {
  query({done: false}, 'camp', res);
});

// Change blood request 'done' status
router.post('/request/done', function (req, res) {
  done(req, res, 'request');
});

// Change blood donor 'done' status
router.post('/donor/done', function (req, res) {
  done(req, res, 'donor');
});

// Change camp 'done' status
router.post('/camp/done', function (req, res) {
  done(req, res, 'camp');
});

// Post and create new camp
router.post('/camp/new', function (req, res) {
  var data = req.body;
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

// post search data and return search results
router.post('/data', function (req, res) {
  var that = this;
  that.req = req;
  that.res = res;
  var data = req.body;
  var model;

  if (data.collection == 'bloodReqs') {
    model = BloodReq;
  } else if (data.collection == 'donors') {
    model = Donor;
  } else if (data.collection == 'camps') {
    model = Camp;
  }

  model.find().sort({modifiedOn: 'descending'}).
    exec(function (err, result) {
      resultCallback.bind(that, err, result)();
    });
});

app.use('/', router);


//run the server========================
var server = app.listen(port, function(){
	console.log('server has started running at localhost:' + port);
});


/**
 * Query the database
 *
 * @param {Object} data
 *    Query data.
 *
 * @param {String} model
 *    Model name of the collection.
 *
 * @param {Object} res
 *    The response object.
 */
function query(data, model, res) {
  var that = {};
  that.res = res;

  switch (model) {
    case 'request':
      BloodReq.find(data).sort({modifiedOn: 'descending'}).
        exec(function (err, result) {
          resultCallback.bind(that, err, result)();
        });
      break;

    case 'donor':
      Donor.find(data).sort({modifiedOn: 'descending'}).
        exec(function (err, result) {
          resultCallback.bind(that, err, result)();
        });
      break;

    case 'camp':
      Camp.find(data).sort({modifiedOn: 'descending'}).
        exec(function (err, result) {
          resultCallback.bind(that, err, result)();
        });
      break;

    default:

  }
}

/**
 * Result callback to handle the obtained result from db.
 *
 * @param {Object} err - Error message.
 *
 * @param {Object} result - Result data.
 */
function resultCallback (err, result) {
  if (!err) {
    this.res.json(result);
  } else {
    console.log('Error receiving data');
    this.res.json({ Error: 'failed to retrieve data' });
  }
}

/**
 * Change done status of objects.
 *
 * @param {Object} req - Request object.
 *
 * @param {Object} res - Response object.
 *
 * @param {String} model - Model name of the collection.
 */
function done (req, res, model) {
  var that = this;
  that.req = req;
  that.res = res;

  switch (model) {
    case 'request':
      BloodReq.findOne({ id: that.req.body.data.id }, function (err, rObj) {
        saveCallback.bind(that, err, rObj)();
      });
      break;

    case 'donor':
      Donor.findOne({ id: that.req.body.data.id }, function (err, rObj) {
        saveCallback.bind(that, err, rObj)();
      });
      break;

    case 'camp':
      Camp.findOne({ id: that.req.body.data.id }, function (err, rObj) {
        saveCallback.bind(that, err, rObj)();
      });
      break;

    default:

  }
}

/**
 * Modify and save data.
 *
 * @param {Object} err - Error message.
 *
 * @param {Object} obj - Object to be saved.
 */
function saveCallback (err, obj) {
  var that = this;
  obj.done = that.req.body.done;
  obj.save(function (err, result) {
    resultCallback.bind(that, err, result)();
  });
}
