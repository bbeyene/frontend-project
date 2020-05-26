
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
app.get('/detectors/*', function (req, res) {
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
  let detectorid = splitPath[2];
  let day = splitPath[3];
  if(day === "sunday") { start = "2011-10-02"; end = "2011-10-03"; }
  else if(day === "monday") { start = "2011-10-03"; end = "2011-10-04"; }
  else if(day === "tuesday") { start = "2011-10-04"; end = "2011-10-05"; }
  else if(day === "wednesday") { start = "2011-10-05"; end = "2011-10-06"; }
  else if(day === "thursday") { start = "2011-10-06"; end = "2011-10-07"; }
  else if(day === "friday") { start = "2011-10-07"; end = "2011-10-08"; }
  else if(day === "saturday") { start = "2011-10-08"; end = "2011-10-09"; }

  // preparing caches queries
  const query = "SELECT * FROM loopdata_by_detector where detectorid = ? and starttime >= ? and starttime < ?";
  const params = [detectorid, start, end];

  // return rows as is, parse on client
  client.execute(query, params, {prepare: true}, function(err, rows) {
	if(rows.length != 0) {
		data[err] = 0;
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
