
const cassandra = require("cassandra-driver");
const config = require("./config");

var express = require("express");
var app = express();
var path = require("path");
var cors = require("cors");
app.use(cors());

app.get('/q1', function (req, res) {
  const client = new cassandra.Client({
    contactPoints: config.cassandra.hosts,
    localDataCenter: config.cassandra.datacenter,
    credentials: {
      username: config.cassandra.username,
      password: config.cassandra.password,
    },
    keyspace: "part 3",
  });

  const query = "SELECT * FROM loopdata_by_startime where detectorid = 1345";
  client.execute(query).then((result) => res.send(result.rows[1]));
});

app.get('/q2', function (req, res) {
  const client = new cassandra.Client({
    contactPoints: config.cassandra.hosts,
    localDataCenter: config.cassandra.datacenter,
    credentials: {
      username: config.cassandra.username,
      password: config.cassandra.password,
    },
    keyspace: "part 3",
  });

  const query = "SELECT * FROM loopdata_by_startime where detectorid = 1346";
  client.execute(query).then((result) => res.send(result.rows[1]));
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
