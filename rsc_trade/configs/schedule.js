/**
 * Created by ZHR on 2015/11/30 0030.
 * Defines all schedule operations on TRADE SERVER
 */

var config_common = require('./config_common');
var Demand = require('../models/Demand');
var DemandOffer = require('../models/DemandOffer');
var DemandOrder = require('../models/DemandOrder');

function getTodayAtZero()
{
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today;
}

module.exports =
{
    // 采购挂单有效期处理
    demandValidityCheck: function()
    {
        var today = getTodayAtZero();
        Demand.update({validity:true,time_validity:{'$lte':today}},{validity:false},{multi:true},function(err)
        {
            if(err)
            {
                console.log('Demand Validity Update ERROR at ' + new Date().toString());
            }
            else
            {
                console.log('Demand Validity Update SUCCESS at ' + new Date().toString());
            }
        });
    }
};
