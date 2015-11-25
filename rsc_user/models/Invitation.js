/**
 * Created by Administrator on 2015/11/6 0006.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var InvitationSchema = new Schema({
        company_name: String,
        company_id: String,
        role: String,
        type: String,
        time_create:{type:Date}
    });

module.exports = mongoose.model('Invitation',InvitationSchema);