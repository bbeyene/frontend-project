
const cassandra = require("cassandra-driver");
const config = require("./config");

var express = require("express");
var app = express();
var path = require("path"); // to serve index
var cors = require("cors");
app.use(cors());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// express routing all detectors
app.get('/data/*', function (req, res) {
  const client = new cassandra.Client({
    contactPoints: config.cassandra.hosts,
    localDataCenter: config.cassandra.datacenter,
    credentials: {
      username: config.cassandra.username,
      password: config.cassandra.password,
    },
    keyspace: "part_3_version_0",
  });

  let data = {
	  'error': 1,
	  'results': ''
  };

  let splitPath = req.path.split('/');
  let direction = splitPath[2];
  let highwayname = splitPath[3];
  let locationtext = splitPath[4].split('%20').join(' ');
  let lane = splitPath[5];
  let day = splitPath[6];

  if(day === "sunday") { start = "2011-10-02"; end = "2011-10-03"; }
  else if(day === "monday") { start = "2011-10-03"; end = "2011-10-04"; }
  else if(day === "tuesday") { start = "2011-10-04"; end = "2011-10-05"; }
  else if(day === "wednesday") { start = "2011-10-05"; end = "2011-10-06"; }
  else if(day === "thursday") { start = "2011-10-06"; end = "2011-10-07"; }
  else if(day === "friday") { start = "2011-10-07"; end = "2011-10-08"; }
  else if(day === "saturday") { start = "2011-10-08"; end = "2011-10-09"; }
  
  const query1 = "SELECT detectorid FROM detectors_by_highway WHERE direction = ? and highwayname = ? and locationtext = ? and lane = ?";
  const params1 = [direction, highwayname, locationtext, lane];
  client.execute(query1, params1, {prepare: true})
	.then(result => { return result.rows[0]; } )
	.then(row => {
			console.log(row.detectorid);
  			let detectorid = row.detectorid;


  // preparing caches queries
  const query2 = "SELECT * FROM loopdata_by_detector where detectorid = ? and starttime >= ? and starttime < ?";
  const params2 = [detectorid, start, end];

  // return rows as is, parse on client
  client.execute(query2, params2, {prepare: true}, function(err, rows) {
	if(rows.length != 0) {
		data['error'] = 0;
		data['results'] = rows;
		res.json(data);
  	} else {
		data[results] = 'no results';
		res.json(data);
	}
  });
});
});

// express routing for maps lat/long
app.get('/map/*', function (req, res) {
  const client = new cassandra.Client({
    contactPoints: config.cassandra.hosts,
    localDataCenter: config.cassandra.datacenter,
    credentials: {
      username: config.cassandra.username,
      password: config.cassandra.password,
    },
    keyspace: "part_3_version_0",
  });

  let data = {
	  'error': 1,
	  'results': ''
  };

  let splitPath = req.path.split('/');
  let direction = splitPath[2];
  let highwayname = splitPath[3];
  let locationtext = splitPath[4].split('%20').join(' ');

  const query = "SELECT latlong FROM detectors_by_highway WHERE direction = ? and highwayname = ? and locationtext = ? limit 1";
  const params = [direction, highwayname, locationtext];
  console.log(params);
  client.execute(query, params, {prepare: true}, function(err, rows) {
	if(rows.length != 0) {
		data['error'] = 0;
		data['results'] = rows;
		res.json(data);
  	} else {
		data[results] = 'no results';
		res.json(data);
	}
  });
});

app.get('/q3', function (req, res) {
  res.sendFile(path.join(__dirname + "/freeway_loopdata_OneHour.json"));
});

app.listen(config.server.port, function () {
  console.log(`Project listening on port ${config.server.port}`);
});
