/**
 * Created by shahar on 09/02/16.
 */

/// <reference path="typings/main.d.ts" />

'use strict';

var fs = require('fs');
var cheerio = require('cheerio');
var args = require('optimist').usage('Usage: dbank source-file target-file').demand([2]).argv;
var moment = require('moment');

var sourceFile = args._[0];
var destFile = args._[1];
var $ = cheerio.load(fs.readFileSync(sourceFile));


var rows = $('div[ng-repeat="table in tables  track by $index"]').filter(function (i, div) {
    return $('h4[ng-if="table.title"]', div).length > 0;
}).first().find('table tr').slice(1).toArray().map(function (row) {
    return $('td', row).toArray().map(function (col) {
        return $(col).text();
    });
}).map(function (row) {
    return {
        date: row[0],
        vdate: row[1],
        desc: row[2],
        amount: row[3],
        id: row[5]
    };
}).map(function (row) {
    return {
        date: moment(row.date, 'DD/MM/YYYY'),
        vdate: moment(row.vdate, 'DD/MM/YYYY'),
        desc: row.desc.replace(/\s+/g, ' ').trim(),
        amount: row.amount.replace(/\s+/g, ' ').trim(),
        id: row.id.replace(/\s+/g, ' ').trim()
    }
});

fs.writeFileSync(destFile, rows.sort(function (row1,row2) {
    return row1.date.isBefore(row2.date)?-1:(row1.date.isSame(row2.date)?0:1);
}).map(function (row) {
    return [row.date.format('MM/DD/YYYY'), row.vdate.format('DD/MM/YYYY'), row.desc,row.id, row.amount].join(',');
}).join('\n'));
