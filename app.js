
'use strict'
/*
* node modules set up ======================================================================
*/
let express = require('express'),
    app = express(),
    NodeGeocoder = require('node-geocoder'),
    tj = require('togeojson'),
    fs = require('fs'),
    _ = require('underscore'),
    config = require('./config'),
    port = config.port,
    apiKey = config.apiKey,
    minValid = config.minValid,
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser,
    kml = new DOMParser().parseFromString(fs.readFileSync(config.fileName, 'utf8'));


/*
* Formatting xml data into JSON Array format ================================================
*/
let converted = tj.kml(kml);
let minValid = 2;
// json contains formatted data(cleaned from kml file)
let json = [];
converted.features.forEach((k) => {
    let a = {}
    a.name = k.properties.name;
    let add = _.flatten(k.geometry.coordinates, true);
    a.address = [];
    if (k.geometry.type == 'Point') {
        a.address.push({ lat: add[1], long: add[0] });
    } else {
        add.forEach(c => {
            a.address.push({ long: c[0], lat: c[1] });
        })
    }
    json.push(a);
})
// console.log('Outlets json ::', JSON.stringify(json, null, 2));


// Route handling
app.get('/api', handler);

async function handler(req, res) {
    try {
        let address = req.query.address;
        console.log('User entered ', address);
        let data = await getLatLong(address);
        console.log('data', data);
        let result = []
        for (let i = 0; i < data.length; i++) {
            result = await processOne(data[i], result);
        }
        console.log('result', result)
        res.send((result.length > 0) ? [...new Set(result)] : 'not Found');
    } catch (err) {
        res.send({ status: 'FAIL', code: 500, msg: 'Internal Server Error', details: err });
    }
}

async function getLatLong(address) {
    let options = {
        provider: 'opencage',
        httpAdapter: 'https', // Default
        apiKey, // for Mapquest, OpenCage, Google Premier
        formatter: null
    };
    let geocoder = NodeGeocoder(options);
    return geocoder.geocode(address)
}

async function processOne(obj, result) {
    let lat = obj.latitude.toFixed(minValid);
    let long = obj.longitude.toFixed(minValid);
    let co = { long, lat };
    json.forEach(outlet => {
        // console.log( 'outlet', outlet, 'co', co)
        let find =  _.find(outlet.address, k => k.lat.toFixed(minValid) == co.lat && k.long.toFixed(minValid) == co.long);
        console.log('find ', find);
        if(find) { result.push(outlet.name)};
    });
    return result;
}






// Express server listening at port ======================================
app.listen(port);
console.log("App listening on port " + port);

