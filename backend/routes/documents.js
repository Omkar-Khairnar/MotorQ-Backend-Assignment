const express = require("express");
const Document = require("../models/document");
const User = require("../models/User");
const { validationResult, body, custom } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const route = express.Router();


const createDocumentValidationRules = [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters')
      .matches(/^[a-zA-Z0-9\s]+$/).withMessage('Name can only contain alphanumeric and space characters'),
      body('document')
      .notEmpty().withMessage('Document cannot be empty')
];

//Route1: Creating Document using owner credentials and data
route.post('/createDocument',createDocumentValidationRules, async(req,res)=>{
    
    try{
        //Validation using express validators
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        const {name, document} =req.body;
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

        const newData=await Document.create({
            name:name,
            owner:user._id,
            document:document
        });

        if(!newData){
            return res.status(500).json({error:true, msg:'Internal Server Error'});
        }

        return res.status(201).json({error:false, msg:'Document Added Successfully', data:newData});

    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})

//Route 2:Getting Documents owned by User Credentials
route.get('/getDocuments-byUserId', async(req, res)=>{
    try{
        const {mobilenum, password, offset, limit}=req.body;
        let user=await User.findOne({mobilenum:mobilenum});
        if(!user) {
            return res.status(404).json({error:true, msg:'User Not Found'});
        }
         //Authenticating User
        const comparedPassword=await bcrypt.compare(password, user.password)
        if(!comparedPassword){
            return res.status(401).json({error:true, msg:'User not authenticated'});
        }

        //Added PAgination , i.e. offset=pagenumber, limit=pagesize
        const documents=await Document.find({owner:user._id}).skip(offset*limit).limit(limit).select('name');
        if(!documents){
            return res.status(500).json({error:true, msg:'Internal Server Error'});
        }
        return res.status(200).json({error:false, msg:'Documents Fetched Successfully', data:documents});
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})

//Route 3: Deleting Document : Only Owner Access
route.post('/deleteDocument', async(req, res)=>{
    try{
        const {mobilenum, password, documentId}=req.body;
        let user=await User.findOne({mobilenum:mobilenum});
        if(!user) {
            return res.status(404).json({error:true, msg:'User Not Found'});
        }
         //Authenticating User
        const comparedPassword=await bcrypt.compare(password, user.password)
        if(!comparedPassword){
            return res.status(401).json({error:true, msg:'User not authenticated'});
        }
        const document=await Document.findById(documentId);
        if(!document){
            return res.status(404).json({error:true, msg:'Document Not Found'});
        }
        if(!document.owner.equals(user._id)){
            return res.status(401).json({error:true, msg:'Document Access Denied'});
        }

        const deleted=await Document.findByIdAndDelete(documentId);
        if(!deleted){
            return res.status(500).json({error:true, msg:'Internal Server Error'});
        }
        return res.status(200).json({error:false, msg:'Document Deleted Successfully', data:deleted});
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})

//Route 4: View Document if User has access either its owner or have access of other documents
route.get('/viewdocument', async(req, res)=>{
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
        //checking document is in database or not
        if(!document){
            return res.status(404).json({error:true, msg:'Document Not Found'});
        }

        //checking access of the documet
        let checkAccess=false;
        document.permissibleUsers.map((ele)=>{
            if(ele === mobilenum){
                checkAccess=true;
                return ;
            }
        })

        if(checkAccess || document.owner.equals(user._id) ){
            return res.status(200).json({error:false, msg:'Documet Fetched Successfully', data:document.document});
        }
        else{
            return res.status(400).json({error:false, msg:'Document Access Denied'})
        }
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("Internal Error Occured");
    }
})





module.exports = route;