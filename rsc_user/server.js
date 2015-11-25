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

app.use('/api/phone', require('./routes/api_phone')());
app.use('/api/user_trade', require('./routes/api_user_trade')());
app.use('/api/user_traffic', require('./routes/api_user_traffic')());
app.use('/api/line', require('./routes/api_company_traffic_line')());
app.use('/api/line_price', require('./routes/api_company_traffic_line_price')());
app.use('/api/company_trade', require('./routes/api_company_trade')());
app.use('/api/company_traffic', require('./routes/api_company_traffic')());
app.use('/api/invitation_trade', require('./routes/api_invitation_trade')());
app.use('/api/invitation_traffic', require('./routes/api_invitation_traffic')());

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