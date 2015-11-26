/**
 * Created by Administrator on 2015/11/16 0016.
 */
var express = require('express');
var body_parser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config_common = require('./configs/config_common');

var app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));
app.use(morgan('dev'));

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

app.get('/',function(req,res)
{
    res.send({status:'success',msg:'Welcome to the TRADE module of RSC system.'});
});

app.use('/api/demand',require('./routes/api_demand')(app,express));


app.use('*',function(req,res)
{
    res.send({status:'not_found'});
});

app.listen(18082,function(err)
{
    if(err)
    {
        console.log('ERROR occurred when trying to start server. ' + new Date().toString());
    }
    else
    {
        console.log('Server started. Listening to PORT: 18080. ' + new Date().toString());
    }
});