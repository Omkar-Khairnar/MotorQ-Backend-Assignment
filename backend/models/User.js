const mongoose = require('mongoose')
const { Schema } = mongoose 

const UserSchema= new Schema({
    name:{
        type:String,
        require:false,
    },
    mobilenum:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:false,
        
    }
},
    {timestamps:true}
)
let user=mongoose.model('users', UserSchema);
module.exports=user
