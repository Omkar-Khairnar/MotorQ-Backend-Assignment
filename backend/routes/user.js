const express = require("express");
const User = require("../models/User");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'OmmIk@$143' 
const { body, validationResult } = require("express-validator");

const route = express.Router();

//Route1:  Creating User Signup
route.post(
  "/createuser",
    [
      body("mobilenum", "Mobile number must be 10 digits long").isLength({
        min: 10,
        max: 10,
      }),
      body("password", "Password must be at least 8 characters long").isLength(
        { min: 8 }
      ),
      body(
        "password",
        "Password must contain at least one alphabet character"
      ).matches(/[a-zA-Z]/),
      body("password", "Password must contain at least one number").matches(
        /\d/
      ),
      body(
        "password",
        "Password must contain at least one special character"
      ).matches(/[!@#$%^&*(),.?":{}|<>]/),
    ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, msg: "Validation error", errors: errors.array() });
    }
    try {
      let user = await User.findOne({ mobilenum: req.body.mobilenum });
      if (user) {
        return res
          .status(500)
          .json({
            error: true,
            msg: "User Already Present. Login with Credentials.",
            data: user,
          });
      }

      const pass = req.body.password
      const salt = await bcrypt.genSaltSync(10)
      const secpass = await bcrypt.hashSync(pass, salt)

      const newuser = await User.create({
        name: req.body.name ? req.body.name : "DefaultName",
        mobilenum: req.body.mobilenum,
        password: secpass,
      });

      if (!newuser) {
        return res
          .status(500)
          .json({ error: true, msg: "Internal Server Error" });
      }

      return res
        .status(201)
        .json({
          error: false,
          msg: "User Created Successfully",
          data: newuser,
        });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Error Occured");
    }
  }
);

route.get('/getAllUsers', async(req, res)=>{
    try{
      const {offset, limit}=req.body;
        const users=await User.find().skip(offset*limit).limit(limit).select('mobilenum');
        if(!users){
            return res.status().json({error:true, msg:'Internal Server Error'});
        }
        res.status(200).json({error:false, msg:'Users Fetched Successfully', data:users});
    }
    catch(err){
      console.error(err.message);
      res.status(500).send("Internal Error Occured");
    }
})

module.exports = route;
