#!/usr/bin/env node

var proj4 = require('proj4')
var csv = require('csv-parser')
var geojson = require('geojson-stream')
var through = require('through2')
var argv = require('minimist')(process.argv.slice(2))

var proj = proj4(argv._[0], argv._[1] || 'WGS84')

var output = process.stdout
if (!argv.ndjson) {
  output = geojson.stringify()
  output.pipe(process.stdout)
}

process.stdin.pipe(csv())
.pipe(through.obj(function write (row, _, next) {
  var coords = [row.X, row.Y]
  var projected = proj.forward(coords)
  delete row.X
  delete row.Y
  for (var k in row) {
    var number = parseFloat(row[k])
    if (!isNaN(number)) { row[k] = number }
  }
  var feature = {
    type: 'Feature',
    properties: row,
    geometry: {
      type: 'Point',
      coordinates: projected
    }
  }

  if (argv.ndjson) { feature = JSON.stringify(feature) + '\n' }
  next(null, feature)
}))
.pipe(output)

