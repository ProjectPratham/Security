//jshint esversion:6
require('dotenv').config()
const express=require('express');
const ejs=require('ejs');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
//var encrypt = require('mongoose-encryption');     level 3 security    
//const md5=require("md5");                         level 3 security     20 billion hash computations per sec
const bcrypt=require("bcrypt");                   //level 4 security     17K hash computions per sec hence hacking speed is very slow
const saltRounds=10;


const app=express();

app.use(express.static('public'));

app.set("view engine",'ejs');

app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema=new mongoose.Schema({     //level 1 security
    email:String,
    password:String
});

/*
secret=process.env.SECRET;  // level 3 security

const encryptedFields = ['password'];
userSchema.plugin(encrypt,{secret,encryptedFields});// level 2 security*/


const User=new mongoose.model("User",userSchema);

app.get("/",(req,res)=>{
    res.render("home");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",async(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        const newUser= User({
            email:req.body.username,
            password:hash
        });
        var a= await User.find({email:req.body.username})
       
        if(a[0]!=null){
            bcrypt.compare(req.body.password, a[0].password, function(err, result) {
                if(result==true){
                    res.render("secrets");
                }
                else{
                    res.redirect("/");
                }
            });
        }
        else if(await newUser.save()){
            res.render("secrets");
        }
    });
    
});

app.post("/login",async(req,res)=>{
    var test=await User.find({email:req.body.username});
    
    if(test[0]!=null){
        bcrypt.compare(req.body.password, test[0].password, function(err, result) {
            if(result==true){
                res.render("secrets");
            }
            else{
                res.redirect("/");
            }
        });
    }
    else{
        redirect("/register")
    }
});

app.listen(3000,function(){
    console.log("server active on port 3000");
})
