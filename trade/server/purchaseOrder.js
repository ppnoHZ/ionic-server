/**
 * Created by Administrator on 2015/11/5.
 */

Meteor.methods({
    getCategory: function (type) {
        check(type, String);
        if(!config.category[type]){
            throw new Meteor.Error(errorCode.categoryNotFound);
        }
        return categoryParam[type];
    },

    deletePurchaseOrder: function (id, tokenString) {
        var err = purchaseOrder.tokenCheck(tokenString);
        if(err){
            throw new Meteor.Error(err);
        }
        var data  = purchaseOrder.findOne({_id:id});
        if(!data){
            throw new Meteor.Error(errorCode.purchaseOrderNotFound);
        }
        var res = token.decode(tokenString, Meteor.settings.secretKeys.trade);
        if(res.companyID != data.companyID){
            throw new Meteor.Error(errorCode.companyNotOne);
        }
        if(data.status == config.publishOrderStatus.CANCELLED){
            throw new Meteor.Error(errorCode.purchaseOrderInvalid);
        }
        if(data.timeValidity.getTime() <= Date.now()){
            throw new Meteor.Error(errorCode.purchaseOrderTimeOut);
        }
        purchaseOrder.update({_id:id},{$set:{
            status: config.publishOrderStatus.CANCELLED,
            editID: res.userID,
            timeEdit : new Date()
        }});
    },

    createPurchaseOrder: function (obj) {
        var err = purchaseOrder.createCheck(obj);
        if(err){
            throw new Meteor.Error(err);
        }
        return purchaseOrder.create(obj);
    },

    editPurchaseOrder: function (id, obj) {
        var err = purchaseOrder.editCheck(obj);
        if(err){
            throw new Meteor.Error(err);
        }
        var data  = purchaseOrder.findOne({_id:id});
        if(!data){
            throw new Meteor.Error(errorCode.purchaseOrderNotFound);
        }
        var res = token.decode(obj.token, Meteor.settings.secretKeys.trade);
        if(res.companyID != data.companyID){
            throw new Meteor.Error(errorCode.companyNotOne);
        }
        if(data.status == config.publishOrderStatus.CANCELLED){
            throw new Meteor.Error(errorCode.purchaseOrderInvalid);
        }
        if(data.timeValidity.getTime() <= Date.now()){
            throw new Meteor.Error(errorCode.purchaseOrderTimeOut);
        }
        return purchaseOrder.edit(id, obj, data);
    }
});