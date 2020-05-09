
const cassandra = require('cassandra-driver');
const config = require('./config')

var express = require('express');
var app = express();
var path = require('path');

app.get('/q1', function (req, res) {

	const client = new cassandra.Client({
		  contactPoints: config.cassandra.hosts,
		  localDataCenter: config.cassandra.datacenter,
		  credentials: { username: config.cassandra.username, password: config.cassandra.password },
		  keyspace: 'part_1'
	});

	const query = 'SELECT * FROM loopdata_one_hour';
	client.execute(query).then(result => res.send(result.rows[1]));
});

app.get('/q2', function (req, res) {

	const client = new cassandra.Client({
		  contactPoints: config.cassandra.hosts,
		  localDataCenter: config.cassandra.datacenter,
		  credentials: { username: config.cassandra.username, password: config.cassandra.password },
		  keyspace: 'part_1'
	});

	const query = 'SELECT * FROM loopdata_one_hour';
	client.execute(query).then(result => res.send(result.rows[5]));
});

app.get('/', function (req, res) {

	res.sendFile(path.join(__dirname + '/index.html'));

});

app.listen(config.server.port, function () {
	   console.log(`Project listening on port ${config.server.port}`);
});
