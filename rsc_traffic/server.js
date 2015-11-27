/**
 * Created by Administrator on 2015/11/6 0006.
 */
var express = require('express');
var mongoose = require('mongoose');
var body_parser = require('body-parser');
var morgan = require('morgan');
var config_server = require('./configs/config_server');

mongoose.connect(config_server.mongodb);

mongoose.connection.on('connected',function() {
    var date_string = new Date().toString();
    console.log('mongodb connection established: ' + date_string);
});

mongoose.connection.on('error',function() {
    var date_string = new Date().toString();
    console.log('mongodb error: ' + date_string + '. Closing....');
    mongoose.connection.close();
});

mongoose.connection.on('disconnected',function() {
    var date_string = new Date().toString();
    console.log('mongodb disconnected: ' + date_string + '. Re connecting....');
    mongoose.connect(config_server.mongodb);
});

mongoose.connection.on('close',function() {
    mongoose.connect(config_server.mongodb);
});

var app = express();

app.all("*", function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Content-Length, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
});

app.use(express.static(__dirname + '/views'));
app.use(body_parser.urlencoded({extended:true}));
app.use(body_parser.json());
app.use(morgan('tiny'));
app.use(require('./middlewares/mid_receive')());

app.use('/api/demand', require('./routes/api_demand')());
app.use('/api/offer', require('./routes/api_offer')());

app.use(require('./middlewares/mid_send')());
app.use('*',function(req, res) {
    res.send({status:'not_found'});
});

app.listen(config_server.port,function(err) {
    console.log('=================================================');
    if(err) {
        console.log('Error Occurred When Starting Server, ' + new Date().toString());
    } else {
        console.log('Server Started. ' + new Date().toString());
        console.log('===================config========================');
        console.log(config_server);
    }
});