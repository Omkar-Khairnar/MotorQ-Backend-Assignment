const express = require("express");
const Document = require("../models/document");
const User = require("../models/User");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const route = express.Router();

const checkNumbers = (arr) => {
    const mobileNumberPattern = /^\d{10}$/; 
  
    const allNumbersAreValid = arr.every((number) => {
      return mobileNumberPattern.test(number) && /^\d+$/.test(number);
    });
  
    return allNumbersAreValid;
  };

//Route 1: Providing Access to Mobile Numbers. Access can be Provided by owner only
route.post('/provideAccess', async(req, res)=>{
    try{
        const {mobilenum, password, documentId, mobNumbers}=req.body;
        const numValidation=checkNumbers(mobNumbers);
        if(!numValidation){
            return res.status(500).json({error:true, msg:"Mobile Numbers are not in correct form"})
        }
        let user=await User.findOne({mobilenum:mobilenum});
        if(!user) {
            return res.status(404).json({error:true, msg:'User Not Found'});
        }
         //Authenticating User
        const comparedPassword=await bcrypt.compare(password, user.password)
        if(!comparedPassword){
            return res.status(401).json({error:true, msg:'User not authenticated'});
        }

        let document=await Document.findById(documentId);
        if(!document){
            return res.status(404).json({error:true, msg:'Document Not Found'});
        }
        if(!document.owner.equals(user._id)){
            return res.status(401).json({error:true, msg:'Document Access Denied'});
        }

        let updated= await Document.findByIdAndUpdate(documentId,{permissibleUsers:mobNumbers});
        if(!updated){
            return res.status(500).json({error:true, msg:'Internal Server Error'});
        }
        return res.status(200).json({error:false, msg:'Access Provided Successfully', data:updated});
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})

//Route 2: Getting Users mobilenumbers which have access to document
route.get('/getDocumentAccessors', async(req, res)=>{
    try{
        const {documentId, mobilenum, password}=req.body;
        let user=await User.findOne({mobilenum:mobilenum});
        if(!user) {
            return res.status(404).json({error:true, msg:'User Not Found'});
        }
         //Authenticating User
        const comparedPassword=await bcrypt.compare(password, user.password)
        if(!comparedPassword){
            return res.status(401).json({error:true, msg:'User not authenticated'});
        }
        let document=await Document.findById(documentId);
        if(!document.owner.equals(user._id)){
            return res.status(401).json({error:true, msg:'Document Access Denied'});
        }

        const data= document.permissibleUsers.filter((ele)=>{
            return ele != mobilenum;
        })
        return res.status(200).json({error:false, msg:'Numbers Having Access Fetched Successfully.', data:data});
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})

//Route 3: Getting Accessible Documents for User Credentials excluding documents in which user is owner
route.get('/getAccessableDocuments', async(req, res)=>{
    try{
        const {mobilenum, password}=req.body;
        let user=await User.findOne({mobilenum:mobilenum});
        if(!user) {
            return res.status(404).json({error:true, msg:'User Not Found'});
        }
         //Authenticating User
        const comparedPassword=await bcrypt.compare(password, user.password)
        if(!comparedPassword){
            return res.status(401).json({error:true, msg:'User not authenticated'});
        }

        const documents=await Document.find({ permissibleUsers: { $in: mobilenum } }).populate({path:'owner', select:'mobilenum'}).select('_id name owner')
        if(!documents){
            return res.status(500).json({error:true, msg:'Internal Server Error'});
        }
        return res.status(200).json({error:false, msg: 'Documents Fetched Successfully', data:documents});
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})

module.exports=route