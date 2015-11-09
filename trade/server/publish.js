/**
 * Created by Administrator on 2015/11/6.
 */

Meteor.publish('purchaseOrder', function(n){
    check(n, Number);
    return purchaseOrder.find({
        status: config.publishOrderStatus.NORMAL,
        timeValidity: {$gt:new Date()}
    }, {limit:n});
});

Meteor.publish('supplyOrder', function(n){
    check(n, Number);
    return supplyOrder.find({
        status: config.publishOrderStatus.NORMAL
    }, {limit:n});
});