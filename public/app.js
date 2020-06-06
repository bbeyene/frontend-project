//let todaysHost = '34.105.22.120';
let mapsKey = 'AIzaSyD62RSwYoexuDkKhjTvTm4UrkpI4jilQzM';
// on deploy
// fetch('q1')
// on development
// fetch(`${proxyurl}/${todaysHost}/q1`)
// or if cors used ...
// fetch(`${todaysHost}/q1`)
var chartSpeed;
var chartVolume;
var chartCongestion;
var locations = document.querySelectorAll(".locations");
var days = document.querySelectorAll(".days");

// fetches from the public folder a table and description of how to use this api
document.querySelector('#useAPI').onclick = function (e) {
    e.preventDefault();
    fetch('api.html')
    .then((response) => response.text())
    .then((html) => {
	document.querySelector('#useAPI').remove();
        document.getElementById("one").innerHTML += html;

	let address = window.location.href;
	let fetch1 = ` fetch ${address}<em>meta</em>`.replace('#', '');
	let fetch2 = ` or fetch ${address}<em>data/detector/lane/date/week</em>`.replace('#', '');

        document.getElementById("api-container").innerHTML += fetch1 + fetch2;
    })
    .catch((error) => {
        console.warn(error);
    });
} 

// when a location is clicked - load a map
// then, when a week + day of week is clicked - load charts
for (let i = 0; i < locations.length; i++) 
	locations[i].onclick = function (e) {
		e.preventDefault();
		let loc = this.id;
		let highway = this.parentNode.parentNode.parentNode.parentNode.id;
		let direction = this.parentNode.parentNode.id;

		document.getElementById("calendar").hidden = false;
		let jumbo = document.getElementById("jumbotron");
		document.getElementById("jumbotron").remove();
		document.getElementById("large-container").appendChild(jumbo);

		document.getElementById("satView").style.display = "block";
		document.getElementById("streetView").style.display= "block";
		getMaps(direction, highway, loc);
		destroyCharts();

		for (let i = 0; i < days.length; i++) {
			days[i].onclick = function (e) {
				e.preventDefault();
				let actives = document.getElementsByClassName("days active");
				for (let j = 0; j < actives.length; j++) 
					actives[j].classList.remove("active");
				let day = this.id;
				let week = document.getElementById("week").textContent.charAt(5);
				document.getElementById(day).classList.add("active");
				getCharts(direction, highway, loc, 1, day, week);
			}
		}
	}

// drawing another chart on the same canvas requires clearing the previous one
function destroyCharts() {
	if (chartVolume != null) 
		chartVolume.destroy();
	if (chartSpeed != null) 
		chartSpeed.destroy();
	if (chartCongestion != null) 
		chartCongestion.destroy();
}

// left and right chevron buttons that show week to e queried when day is clicked
document.getElementById("prev").addEventListener("click", function (e) {
	e.preventDefault();
	let current = parseInt(document.getElementById("week").textContent.charAt(5))
	if (current == 1)
		document.getElementById("week").innerText = "Week 8";
	else
		document.getElementById("week").innerText = "Week " + --current;
})

// left and right chevron buttons that show week to e queried when day is clicked
document.getElementById("next").addEventListener("click", function (e) {
	e.preventDefault();
	let current = parseInt(document.getElementById("week").textContent.charAt(5));
	if (current == 8)
		document.getElementById("week").innerText = "Week 1";
	else
		document.getElementById("week").innerText = "Week " + ++current;
})

// changes the existing api call to google maps by changing the heading (direction)
document.getElementById("left").addEventListener("click", function (e) {
	e.preventDefault();
	let streetImg = document.getElementById("streetImg");
	let re = /heading=(.)*&pitch/;
	let str = streetImg.src.match(re);
	let oldHeading = str[0].match(/\d+/);
	let newHeading = parseInt(oldHeading[0]) - 30;
	let newCall = streetImg.src.replace(re, "heading=" + newHeading + "&pitch");
	streetImg.src = newCall;
});

// changes the existing api call to google maps by changing the heading (direction)
document.getElementById("right").addEventListener("click", function (e) {
	e.preventDefault();
	let streetImg = document.getElementById("streetImg");
	let re = /heading=(.)*&pitch/;
	let str = streetImg.src.match(re);
	let oldHeading = str[0].match(/\d+/);
	let newHeading = parseInt(oldHeading[0]) + 30;
	let newCall = streetImg.src.replace(re, "heading=" + newHeading + "&pitch");
	streetImg.src = newCall;
});

// fetch the map lat/long of the location then call maps api
function getMaps(direction, highway, loc) {
	//fetch(`${todaysHost}/map/${direction}/${highway}/${loc}`) 
	fetch(`map/${direction}/${highway}/${loc}`)
		.then(response => { return response.json(); })
		.then(data => {
			let width = 800;
			let height = 600;
			let pitch = 0;
			let fov = 120;
			let heading;
			if (direction === 'NORTH') 
				heading = 360;
			else if (direction === 'SOUTH') 
				heading = 180;
			let lat = data.results.rows[0].latlong[0];
			let lon = data.results.rows[0].latlong[1];
			let zoom = 20;

			// update the maps bootstrap cards with street image
			let streetImg = document.getElementById("streetImg");
			streetImg.src = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lon}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${mapsKey}`;
			document.getElementById("streetImg").setAttribute("alt", loc + ' street view from google maps');

			// update the maps bootstrap cards with satellite image
			let satImg = document.getElementById("satImg");
			satImg.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&maptype=hybrid&key=${mapsKey}`;
			document.getElementById("satViewTitle").innerText = loc + " on " + highway;
			document.getElementById("satImg").setAttribute("alt", loc + ' satellite view from google maps');
			return true;
		})
		.catch(error => {
			console.log('failed', error);
		})
}

// draw a volume per lane chart
function createChartVolume(totalVolume) {
	document.getElementById("volumeChart").style.display = "block";
	document.getElementById("volumeChartTitle").innerText = "Number of vehicles per day";
	if (chartVolume != null) 
		chartVolume.destroy();
	document.getElementById('chartVolume').getContext('2d').clearRect(0, 0, this.width, this.height);
	chartVolume = new Chart(document.getElementById('chartVolume'), {
		type: 'doughnut',
		data: {
			labels: ['left'],
			datasets: [
				{
					label: 'Volume',
					backgroundColor: ['rgb(0, 64, 128)'],
					data: [totalVolume]
				}
			]
		},
		options: {
			title: {
				display: true,
			}
		}
	});
}

// draw a speed vs time of day chart
function createChartSpeed(starttime, speed) {
	document.getElementById("speedChart").style.display = "block"
	document.getElementById("speedChartTitle").innerText = "Speed";
	document.getElementById("speed-desc").innerText = "20-second averages in mph";
	if (chartSpeed != null)
		chartSpeed.destroy();
	chartSpeed = new Chart(document.getElementById("chartSpeed").getContext("2d"), {
		type: 'line',
		data: {
			labels: starttime,
			datasets: [{
				label: 'left',
				data: speed,
				borderColor: 'rgb(0, 64, 128)',
				backgroundColor: 'rgb(0, 64, 128)',
				fill: false,
				showLine: false,
				pointRadius: 1
			}]
		},
		options: {
			animation: {
				duration: 0
			},
			hover: {
				animationDuration: 0
			},
			responsiveAnimationDuration: 0
		},
		defaults: {
			line: {
				showLine: false,
			}
		}
	});
}

// draw a percentage of time car spends on a sensor vs time of day average chart
function createCongestionChart(starttime, occupancy) {
	document.getElementById("congestionChart").style.display = "block";
	document.getElementById("congestionChartTitle").innerText = "Congestion";
	document.getElementById("congestion-desc").innerText = "percentage of time cars are on a sensor";
	if (chartCongestion != null) 
		chartCongestion.destroy();
	document.getElementById('chartCongestion').getContext('2d').clearRect(0, 0, this.width, this.height);
	chartCongestion = new Chart(document.getElementById("chartCongestion").getContext("2d"), {
		type: 'line',
		data: {
			labels: starttime,
			datasets: [{
				label: 'left',
				data: occupancy,
				borderColor: 'rgb(0, 64, 128)',
				backgroundColor: 'rgb(0, 64, 128)',
				fill: false,
				showLine: true,
				pointRadius: 1
			}]
		},
		options: {
			animation: {
				duration: 0.3
			},
			hover: {
				animationDuration: 0
			},
			responsiveAnimationDuration: 0
		},
		defaults: {
			line: {
				showLine: true,
			}
		}
	});
}

// draw all charts per the buttoms from the sidebar navigation and top navigation
function getCharts(direction, highway, loc, lane, day, week) {
	//fetch(`${todaysHost}/data/${direction}/${highway}/${loc}/${lane}/${day}/${week}`) 
	fetch(`data/${direction}/${highway}/${loc}/${lane}/${day}/${week}`)
		.then(response => { return response.json(); })
		.then(data => {
			returnedRows = data.results.rows;
			starttime = [];
			starttime = returnedRows.map(x => moment.utc((x['starttime'])).format('h:mm a'));
			speed = [];
			speed = returnedRows.map(x => x['speed']);
			volume = [];
			totalVolume = 0;
			volume = returnedRows.map(x => x['volume']);
			volume.forEach(v => totalVolume += v);
			// create an average occupancy for 20-minute intervals
			occupancy = [];
			occupancy = returnedRows.map(x => x['occupancy']);
			let segment = Math.floor(occupancy.length / 48);
			occupancyAvg = [];
			for (let i = 0; i < occupancy.length; i += segment) {
				let tempBin = 0;
				for (let j = i; j < i + segment; j++) {
					tempBin += occupancy[j];
				}
				occupancyAvg.push(Math.round(tempBin /= segment));
			}
			timeSlices = [];
			for (let i = 0; i < starttime.length; i += segment) {
				timeSlices.push(starttime[i]);
			}

			// create charts functions defined aboove
			createChartSpeed(starttime, speed);
			createCongestionChart(timeSlices, occupancyAvg);
			createChartVolume(totalVolume);

			//return fetch(`${todaysHost}/data/${direction}/${highway}/${loc}/${lane + 1}/${day}/${week}`)
			return fetch(`data/${direction}/${highway}/${loc}/${lane + 1}/${day}/${week}`)
		})
		//having fetched the first lane's data, fetch the second lane's
		.then(response => { return response.json(); })
		.then(data => {
			returnedRows = data.results.rows;
			speed = [];
			speed = returnedRows.map(x => x['speed']);
			volume = [];
			totalVolume = 0;
			volume = returnedRows.map(x => x['volume']);
			volume.forEach(v => totalVolume += v);
			occupancy = returnedRows.map(x => x['occupancy']);
			let segment = Math.floor(occupancy.length / 48);
			occupancyAvg = [];
			for (let i = 0; i < occupancy.length; i += segment) {
				let tempBin = 0;
				for (let j = i; j < i + segment; j++) {
					tempBin += occupancy[j];
				}
				occupancyAvg.push(Math.round(tempBin /= segment));
			}

			anotherSpeed = {
				label: 'middle',
				data: speed,
				borderColor: 'rgb(0, 128, 255)',
				backgroundColor: 'rgb(0, 128, 255)',
				fill: false,
				showLine: false,
				pointRadius: 1
			}
			label = 'middle';
			backgroundColor = 'rgb(0, 128, 255)';
			anotherCongestion = {
				label: 'middle lane',
				data: occupancyAvg,
				borderColor: 'rgb(0, 128, 255)',
				backgroundColor: 'rgb(0, 128, 255)',
				fill: false,
				showLine: true,
				pointRadius: 1
			}
			// update the charts with the second lane's data
			chartSpeed.data.datasets.push(anotherSpeed);
			chartSpeed.update(0);
			chartVolume.data.labels.push(label);
			chartVolume.data.datasets[0].data.push(totalVolume);
			chartVolume.data.datasets[0].backgroundColor.push(backgroundColor);
			chartVolume.update(0);
			chartCongestion.data.datasets.push(anotherCongestion);
			chartCongestion.update(0);
			//return fetch(`${todaysHost}/data/${direction}/${highway}/${loc}/${lane + 2}/${day}/${week}`)
			return fetch(`data/${direction}/${highway}/${loc}/${lane + 2}/${day}/${week}`)
		})
		//having fetched the second lane's data, fetch the third lane's
		.then(response => { return response.json(); })
		.then(data => {
			returnedRows = data.results.rows;
			speed = [];
			speed = returnedRows.map(x => x['speed']);
			volume = [];
			totalVolume = 0;
			volume = returnedRows.map(x => x['volume']);
			volume.forEach(v => totalVolume += v);
			occupancy = returnedRows.map(x => x['occupancy']);
			let segment = Math.floor(occupancy.length / 48);
			occupancyAvg = [];
			for (let i = 0; i < occupancy.length; i += segment) {
				let tempBin = 0;
				for (let j = i; j < i + segment; j++) {
					tempBin += occupancy[j];
				}
				occupancyAvg.push(Math.round(tempBin /= segment));
			}

			anotherSpeed = {
				label: 'right',
				data: speed,
				borderColor: 'rgb(128, 192, 255)',
				backgroundColor: 'rgb(128, 192, 255)',
				fill: false,
				showLine: false,
				pointRadius: 1
			}
			label = 'right';
			backgroundColor = 'rgb(128, 192, 255)',
			anotherCongestion = {
				label: 'right',
				data: occupancyAvg,
				borderColor: 'rgb(128, 192, 255)',
				backgroundColor: 'rgb(128, 192, 255)',
				fill: false,
				showLine: true,
				pointRadius: 1
			}
			// update the existing chart with the third lane's data
			chartSpeed.data.datasets.push(anotherSpeed);
			chartSpeed.update(0);
			chartVolume.data.labels.push(label);
			chartVolume.data.datasets[0].data.push(totalVolume);
			chartVolume.data.datasets[0].backgroundColor.push(backgroundColor);
			chartVolume.update(0);
			chartCongestion.data.datasets.push(anotherCongestion);
			chartCongestion.update(0);
		})
		.catch(error => {
			console.log('failed', error)
		})
}
