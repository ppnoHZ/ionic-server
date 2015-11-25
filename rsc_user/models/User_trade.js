/**
 * Created by Administrator on 2015/11/6 0006.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
        phone:      {type:String, required:true, unique:{index:true}},
        password:   {type:String ,required:true, select:false},
        real_name: {type:String, default:''},
        role:       {type:String, default:''},
        gender:     {type:String, default:'MALE'},
        company_id: {type:String, default:''},
        photo_url:  {type:String, default:''}
    });

UserSchema.pre('save',function(next) {
    var user = this;
    if(!user.isModified('password')) {
        return next();
    }
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    });
});

UserSchema.method('comparePassword', function (password) {
    return bcrypt.compareSync(password, this.password);
});

module.exports = mongoose.model('user_trade', UserSchema);