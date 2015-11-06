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
    },
    editSupplyOrder: function (id, obj) {
        var err = supplyOrder.editCheck(obj);
        if(err){
            throw new Meteor.Error(err);
        }
        var data  = supplyOrder.findOne({_id: id});
        if(!data){
            throw new Meteor.Error(errorCode.supplyOrderNotFound);
        }
        var res = token.decode(obj.token, Meteor.settings.secretKeys.trade);
        if(res.companyID != data.companyID){
            throw new Meteor.Error(errorCode.companyNotOne);
        }
        if(data.status == config.publishOrderStatus.CANCELLED){
            throw new Meteor.Error(errorCode.supplyOrderInvalid);
        }
        return supplyOrder.edit(id, obj, data);
    },
    deleteSupplyOrder: function(id, tokenString){
        var err = purchaseOrder.tokenCheck(tokenString);
        if(err){
            throw new Meteor.Error(err);
        }
        var data  = supplyOrder.findOne({_id: id});
        if(!data){
            throw new Meteor.Error(errorCode.supplyOrderNotFound);
        }
        var res = token.decode(obj.token, Meteor.settings.secretKeys.trade);
        if(res.companyID != data.companyID){
            throw new Meteor.Error(errorCode.companyNotOne);
        }
        if(data.status == config.publishOrderStatus.CANCELLED){
            throw new Meteor.Error(errorCode.supplyOrderInvalid);
        }
        supplyOrder.update({_id:id},{$set:{
            status: config.publishOrderStatus.CANCELLED,
            editID: res.userID,
            timeEdit : new Date()
        }});
    }
});