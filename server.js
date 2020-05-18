
const cassandra = require("cassandra-driver");
const config = require("./config");

var express = require("express");
var app = express();
var path = require("path");
var cors = require("cors");
app.use(cors());


app.get('/1345', function (req, res) {
  const client = new cassandra.Client({
    contactPoints: config.cassandra.hosts,
    localDataCenter: config.cassandra.datacenter,
    credentials: {
      username: config.cassandra.username,
      password: config.cassandra.password,
    },
    keyspace: "part_3_testing_3",
  });

  let data = {
	  'error': 1,
	  'results': ''
  };
  const query = "SELECT * FROM loopdata_by_detector where detectorid = 1345";
  
  client.execute(query, function(err, rows) {
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
app.get('/1346', function (req, res) {
  const client = new cassandra.Client({
    contactPoints: config.cassandra.hosts,
    localDataCenter: config.cassandra.datacenter,
    credentials: {
      username: config.cassandra.username,
      password: config.cassandra.password,
    },
    keyspace: "part_3_testing_3",
  });

  let data = {
	  'error': 1,
	  'results': ''
  };
  const query = "SELECT * FROM loopdata_by_detector where detectorid = 1346";
  
  client.execute(query, function(err, rows) {
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

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(config.server.port, function () {
  console.log(`Project listening on port ${config.server.port}`);
});
