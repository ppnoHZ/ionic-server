/**
 * Created by Administrator on 2015/11/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TruckSchema = new Schema({
    number: {type:String, required:true},//车牌号
    type: {type:String, required:true},//类型
    volume: {type:String, required:true},//体积
    long: {type:String, required:true},//车长
    weight: {type:String, required:true},//载重
    //status: {type:String},  //本地车，回程车，不限
    user_id: {type:Array},   //所属用户,
    route_id: {type:String},    //线路id(运输中使用)
    use: {type:Boolean, default: false}
});

module.exports = mongoose.model('truck', TruckSchema);
