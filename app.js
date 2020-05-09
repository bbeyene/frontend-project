// on development
let todaysHost = 'ip:port/';
// todo: ttps://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe

const proxyurl = "https://cors-anywhere.herokuapp.com/";

document.getElementById("get 1").onclick = function () {
// on deploy
    fetch(q1)
// on development
    //fetch(`${proxyurl}${todaysHost}q1`)
        .then(response => response.json())
        .then(data => document.getElementById("info 1").innerHTML += data.detectorid + ' ' + data.starttime + ' ' + data.dqflags);
}
document.getElementById("get 2").onclick = function () {
// on deploy
    fetch(q2)
// on development
    //fetch(`${proxyurl}${todaysHost}q2`)
        .then(response => response.json())
        .then(data => document.getElementById("info 2").innerHTML += data.detectorid + ' ' + data.starttime + ' ' + data.dqflags);
}