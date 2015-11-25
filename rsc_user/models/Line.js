/**
 * Created by Administrator on 2015/11/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LineSchema = new Schema({
    start_province: {type:String, required: true},  //省
    start_city: {type:String, required: true},      //市
    start_district: {type:String},    //区县
    start_detail: {type:String},    //详细
    end_province: {type:String, required: true},  //省
    end_city: {type:String, required: true},      //市
    end_district: {type:String},    //区县
    end_detail: {type:String},    //详细
    users: {type:Array},            //司机id
    company_id: {type:String, required: true}      //所属公司id
});

module.exports = mongoose.model('line', LineSchema);