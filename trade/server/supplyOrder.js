/**
 * Created by Administrator on 2015/11/6.
 */
Meteor.methods({
    createSupplyOrder: function (obj) {
        var err = supplyOrder.createCheck(obj);
        if(err){
            throw new Meteor.Error(err);
        }
        return supplyOrder.create(obj);
    }
});