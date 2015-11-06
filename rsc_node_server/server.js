/**
 * Created by Administrator on 2015/11/6 0006.
 */
var express = require('express');
var mongoose = require('mongoose');
var body_parser = require('body-parser');
var morgan = require('morgan');
var config_common = require('./configs/config_common');

mongoose.connect(config_common.db);

mongoose.connection.on('connected',function()
{
    var date_string = new Date().toString();
    console.log('DB connection established: ' + date_string);
});

mongoose.connection.on('error',function()
{
    var date_string = new Date().toString();
    console.log('DB error: ' + date_string + '. Closing....');
    mongoose.connection.close();
});

mongoose.connection.on('disconnected',function()
{
    var date_string = new Date().toString();
    console.log('DB disconnected: ' + date_string + '. Re connecting....');
    mongoose.connect(config_common.db);
});

mongoose.connection.on('close',function()
{
    mongoose.connect(config_common.db);
});


var app = express();
app.use(body_parser.urlencoded({extended:true}));
app.use(body_parser.json());
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/views'));

var api_user = require('./routes/api_user')(app,express);

app.use('/api/user',api_user);

app.use('*',function(req,res)
{
    res.send({status:'not_found'});
});

app.listen(18080,function(err)
{
    if(err)
    {
        console.log('Error Occurred When Starting Server, ' + new Date().toString());
    }
    else
    {
        console.log('Server Started. ' + new Date().toString());
    }
});