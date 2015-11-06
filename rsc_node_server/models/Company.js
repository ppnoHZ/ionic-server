/**
 * Created by Administrator on 2015/11/6 0006.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CompanySchema = new Schema(
    {
        full_name:String,
        type:String,
        has_admin:{type:Boolean, default:false},
        nick_name:String,
        currency:Number,
        verify_phase:{type:String,default:'NO'},
        status:{type:String,default:'n_n'},
        url_yingyezhizhao:String
    }
);

module.exports = mongoose.model('Company',CompanySchema);