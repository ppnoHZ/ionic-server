/**
 * Created by Administrator on 2015/11/6 0006.
 */
var express = require('express');
var User = require('../models/User_trade');
var Company = require('../models/Company_trade');

module.exports = function() {
    var api = express.Router();
    return api;
};