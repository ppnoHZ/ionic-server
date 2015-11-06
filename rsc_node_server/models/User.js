/**
 * Created by Administrator on 2015/11/6 0006.
 */
var mongoose = require('mongoose');
var crypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var UserSchema = new Schema(
    {
        u_id:{type:String,required:true,unique:true},
        phone:{type:String,required:true,unique:{index:true}},
        password:{type:String,required:true,select:false},
        real_name:{type:String,default:''},
        role:{type:String,default:''},
        gender:{type:String,default:''},
        company_id:{type:String,default:''},
        photo_url:{type:String,default:''}
    }
);

UserSchema.pre('save',function(err,next)
{
    var user = this;
    if(!user.isModified('password'))
    {
        return next();
    }
    bcrypt.hash(user.password,null,null,function(err, hash)
    {
        if(err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.comparePassword = function(password)
{
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User',UserSchema);