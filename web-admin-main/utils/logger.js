var fs = require('fs');
var pinoms = require('pino-multi-stream');
const moment = require('moment');
const today = moment().format('MM-DD-YYYY');

var prettyStream = pinoms.prettyStream()
var streams = [
    {stream: fs.createWriteStream('./log/webadmin_'+today+'.log', { flags: 'a' }) },
    {stream: prettyStream }
]

var logger = pinoms(pinoms.multistream(streams))

module.exports = logger;