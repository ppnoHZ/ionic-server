/**
 * Created by Administrator on 2015/11/30.
 */
var mongoose = require('mongoose');
var config_common = require('../configs/config_common');
var Schema = mongoose.Schema;

var TrafficRoute = new Schema({
    order_id :{type:String, required:true},                                             //所属订单id
    address: {type:Array},                                                            //中途地址[{time:xxx,location:xxx},{}]
    status : {type:String, default: config_common.route_status.ready}           //物流状态
});

module.exports = mongoose.model('TrafficRoute', TrafficRoute);