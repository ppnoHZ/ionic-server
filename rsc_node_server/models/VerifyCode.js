/**
 * Created by Administrator on 2015/11/6 0006.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var VerifyCodeSchema = new Schema({
        code: {type:String},
        phone: {type:String},
        time: {type:Date, default: new Date()}
    });
module.exports = mongoose.model('VerifyCode', VerifyCodeSchema);