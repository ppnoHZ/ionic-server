/**
 * Created by Administrator on 2015/11/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LinePriceSchema = new Schema({
    line_id: {type:String, required: true}, //所属线路id
    company_id: {type:String, required: true}, //所属公司id
    type: {type:String, required: true},    //车辆类型
    money: {type:Number, required: true} //价格
});

module.exports = mongoose.model('line_price', LinePriceSchema);