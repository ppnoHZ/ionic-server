/**
 * Created by Administrator on 2015/10/27.
 */
var express = require('express');
var fs = require('fs');
var body_parser =require('body-parser');
var formidable = require('formidable');
var jwt = require('jsonwebtoken');
var config = require('./config');
var app = express();

app.use(body_parser.urlencoded({extended:true}));
app.use(body_parser.json());
app.use(express.static(__dirname+'/temp'));

app.post('/upload/:upload_name/:token',function(req,res)
{
    jwt.verify(req.params.token,config.secret_key,function(err,decoded)
    {
        if(err)
        {
            res.send({status:'token_verification_failed'});
        }
        else
        {
            var t_now = new Date().getTime();
            if(decoded.file_name === req.params.upload_name && (t_now - decoded.time) <= 60 * 1000)
            {
                var form = new formidable.IncomingForm();
                form.uploadDir = config.temp_path;
                form.parse(req,function(err,fields,files)
                {
                    //console.log(files['file']);
                    var file = files['file'];
                    if(!file){
                        res.send({status:'file not found'});
                        return;
                    }
                    var extension = file.name.split('.').pop();
                    var valid = false;
                    for(var index in config.file_format)
                    {
                        if(extension == config.file_format[index])
                        {
                            valid = true;
                            break;
                        }
                    }
                    if(!valid || file.size > config.file_size)
                    {
                        fs.unlink(file.path,function(err)
                        {
                            if(err)
                            {
                                res.send({status:'err',msg:err});
                            }
                            else
                            {
                                res.send({status:'invalid_file_format_or_size'});
                            }
                        });
                        return;
                    }
                    var file_name = req.params.upload_name + '.' + extension;
                    fs.exists(config.temp_path + file_name,function(exist)
                    {
                        if(exist)
                        {
                            fs.unlink(config.temp_path + file_name,function(err)
                            {
                                if(err)
                                {
                                    res.send({status:'err',msg:err});
                                    return;
                                }
                                fs.rename(file.path, config.temp_path + file_name, function(err)
                                {
                                    if(err)
                                    {
                                        res.send({status:'err',msg:err});
                                        return;
                                    }
                                    res.send({status:'success',url:'http://'+config.ip+':'+config.port+'/'+file_name,msg:'original file is replaced.'});
                                });
                            });
                        }
                        else
                        {
                            fs.rename(file.path, config.temp_path + file_name, function(err)
                            {
                                if(err)
                                {
                                    res.send({status:'err',msg:err});
                                    return;
                                }
                                res.send({status:'success', url:'http://'+config.ip+':'+config.port+'/'+file_name});
                            });
                        }
                    });

                });
            }
            else
            {
                res.send({status:'invalid_token'});
            }
        }
    });
});

app.get('/verify_token/:token',function(req,res)
{
    var token = req.params.token;
    jwt.verify(req.params.token,config.secret_key,function(err,decoded)
    {
        if(err)
        {
            res.send({status:'err',msg:err});
        }
        else
        {
            res.send({status:'success',decoded:decoded});
        }
    });
});

/*app.get('/generate_token/:input',function(req,res)
{
    var token = jwt.sign(
        {
            your_input:req.params.input
        },
        config.secret_key,
        {
            expiresIn:60
        }
    );
   res.send({status:'success',token:token});
});*/

app.get('/',function(req,res)
{
    res.send({status:'success',msg:'Hello, this is the file uploader for RSC.'});
});

app.use('*',function(req,res)
{
    res.status(404).send({status:'not_found'});
});

app.listen(config.port,function(err)
{
    if(err)
    {
        console.log('Error occurred when starting server');
    }
    else
    {
        console.log("Server Started. Listening to PORT: 18080");
    }
});