/**
 * Created by Administrator on 2015/11/6 0006.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var VerifyCodeSchema = new Schema(
    {
        code:String,
        verified:{type:Boolean, default:false},
        time:{type:Date, default:Date.now()}
    }
);

module.exports = mongoose.model('VerifyCode',VerifyCodeSchema);