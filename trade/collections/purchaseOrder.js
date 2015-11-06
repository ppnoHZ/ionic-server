/**
 * Created by Administrator on 2015/11/5.
 */

purchaseOrder = new Mongo.Collection("purchaseOrder");

function PurchaseOrder(){
    this.companyID = '';    //公司id
    this.userID = '';   //用户id
    this.editID = '';   //最后修改人id
    this.timeEdit = new Date(); //最后修改时间
    this.timeCreation = new Date();   //创建时间
    this.category = ''; //货物类型
    this.categoryChn = ''; //货物类型中文
    this.amount = 0;    //采购数量
    this.desc = {}; //货物参数描述
    this.timeArrival = new Date();  //提货时间
    this.locationArrival = '';  //提货地点
    this.stylePayment = 0;  //付款方式
    this.styleOffer = '';   //报价方式
    this.timeValidity = new Date(); //有效期
    this.canJoin = false;   //可否凑单
    this.originCheck = '';  //质检结果
    this.attAccount = '';   //产品结算细则
    this.attTraffice = '';   //物流细则
    this.attLiability = '';   //违约责任
    this.status = config.purchaseOrderStatus.NORMAL;   //状态
}

purchaseOrder.create = function(obj){
    var data = new PurchaseOrder();
    data.category = obj.category; //货物类型
    data.categoryChn = config.categoryName[obj.category]; //货物类型中文
    data.amount = parseInt(obj.amount);    //采购数量
    var res = token.decode(obj.token, Meteor.settings.secretKeys.trade);
    data.companyID = res.companyID;    //公司id
    data.userID = res.userID;    //用户id
    data.desc = _.clone(categoryParam[obj.category]); //货物参数描述
    for(var key in categoryParam[obj.category]){
        if(obj.desc[key]){
            data.desc[key] = obj.desc[key];
        }
    }
    data.timeArrival = new Date(obj.timeArrival);  //提货时间
    data.locationArrival = obj.locationArrival;  //提货地点
    data.stylePayment = parseInt(obj.stylePayment)/100;  //付款方式
    data.styleOffer = obj.styleOffer;   //报价方式
    data.timeValidity = new Date(obj.timeValidity); //有效期
    data.canJoin = obj.canJoin;   //可否凑单
    data.originCheck = obj.originCheck;  //质检结果
    data.attAccount = '';   //产品结算细则
    data.attTraffice = '';   //物流细则
    data.attLiability = '';   //违约责任
    return purchaseOrder.insert(data);
};

purchaseOrder.edit = function(id, obj, doc){
    var data = {};
    if(obj.category){
        data['category'] = obj.category;
        data.categoryChn = config.categoryName[obj.category]; //货物类型中文
    }
    obj.amount ? data['amount'] = parseInt(obj.amount) : 0;
    var res = token.decode(obj.token, Meteor.settings.secretKeys.trade);
    res.editID = res.userID;
    res.timeEdit = new Date();
    if(obj.desc){
        data.desc = doc.desc;
        for(var key in data.desc){
            if(obj.desc[key]){
                data.desc[key] = obj.desc[key];
            }
        }
    }
    obj.timeArrival ? data.timeArrival = new Date(obj.timeArrival) : 0;  //提货时间
    obj.locationArrival ? data.locationArrival = obj.locationArrival : 0;  //提货地点
    obj.stylePayment ? data.stylePayment = parseInt(obj.stylePayment)/100 : 0;  //付款方式
    obj.styleOffer ? data.styleOffer = obj.styleOffer : 0;   //报价方式
    obj.timeValidity ? data.timeValidity = new Date(obj.timeValidity) : 0; //有效期
    obj.canJoin ? data.canJoin = obj.canJoin : 0;   //可否凑单
    obj.originCheck ? data.originCheck = obj.originCheck : 0;  //质检结果
    obj.attAccount ? data.attAccount = '' : 0;   //产品结算细则
    obj.attTraffice ? data.attTraffice = '' : 0;   //物流细则
    obj.attLiability ? data.attLiability = '' : 0;   //违约责任
    if (!Object.keys(data).length) {
        return;
    }
    purchaseOrder.update({_id: id}, {$set: data});
};

purchaseOrder.tokenCheck = function(data){
    var res = token.decode(data, Meteor.settings.secretKeys.trade);
    if(!res){
        return errorCode.token;
    }
    if(Date.now() - res.time > config.purchaseTimeOut){
        return errorCode.tokenTimeOut;
    }
};

purchaseOrder.editCheck = function(obj){
    var err;
    if(obj.category){
        err = common.categoryCheck(obj.category);
        if(err){
            return err;
        }
    }

    if(obj.amount){
        err = common.amountCheck(obj.amount);
        if(err){
            return err;
        }
    }

    err = purchaseOrder.tokenCheck(obj.token);
    if(err){
        return err;
    }

    obj.desc ? check(obj.desc, Object) : 0;

    if(obj.timeArrival){
        err = common.timeCheck(obj.timeArrival);
        if(err){
            return err;
        }
    }

    if(obj.locationArrival){
        err = common.addressCheck(obj.locationArrival);
        if(err){
            return err;
        }
    }

    if(obj.stylePayment){
        err = common.stylePaymentCheck(obj.stylePayment);
        if(err){
            return err;
        }
    }


    obj.styleOffer ?　check(obj.styleOffer, String) : 0;

    if(obj.timeValidity){
        err = common.timeCheck(obj.timeValidity);
        if(err){
            return err;
        }
    }

    obj.canJoin ? check(obj.canJoin, Boolean) : 0;

    if(obj.originCheck){
        err = common.originCheck(obj.originCheck);
        if(err){
            return err;
        }
    }

};

purchaseOrder.createCheck = function(obj){

    var err = common.categoryCheck(obj.category);
    if(err){
        return err;
    }

    err = common.amountCheck(obj.amount);
    if(err){
        return err;
    }

    err = purchaseOrder.tokenCheck(obj.token);
    if(err){
        return err;
    }

    check(obj.desc, Object);

    err = common.timeCheck(obj.timeArrival);
    if(err){
        return err;
    }

    err = common.addressCheck(obj.locationArrival);
    if(err){
        return err;
    }

    err = common.stylePaymentCheck(obj.stylePayment);
    if(err){
        return err;
    }

    check(obj.styleOffer, String);

    err = common.timeCheck(obj.timeValidity);
    if(err){
        return err;
    }

    check(obj.canJoin, Boolean);

    err = common.originCheck(obj.originCheck);
    if(err){
        return err;
    }
};