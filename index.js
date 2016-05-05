#!/usr/bin/env node

var proj4 = require('proj4')
var csv = require('csv-parser')
var geojson = require('geojson-stream')
var through = require('through2')

var proj = proj4(process.argv[2], process.argv[3] || 'WGS84')

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
  next(null, feature)
}))
.pipe(geojson.stringify())
.pipe(process.stdout)

