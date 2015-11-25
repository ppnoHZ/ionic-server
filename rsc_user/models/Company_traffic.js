/**
 * Created by Administrator on 2015/11/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
    full_name:{type:String, required: true},
    type:{type:String, required: true},
    has_admin:{type:Boolean, default:true},
    nick_name:{type:String, default:''},
    currency:{type:Number, default:0},
    verify_phase:{type:String,default:'NO'},
    status:{type:String,default:'n_n'},
    url_yingyezhizhao:{type:String}
});

module.exports = mongoose.model('company_traffic', CompanySchema);