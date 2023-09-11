const mongoose = require('mongoose')
const { Schema } = mongoose 


const DocumentSchema=new Schema({
    name:{
        type:String,
        require:true,
        maxLength:[50]
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        require:true,
    },
    document:{
        type:Object,
        require:true
    },
    permissibleUsers:[]
},
    {timestamps:true}
)

let document=mongoose.model('documents', DocumentSchema);
module.exports=document;
