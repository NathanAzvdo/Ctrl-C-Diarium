const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    eAdmin:{
        type:Number,
        default:0
    },
    resetpasstoken:{
        type: String,
        select: false
    },
    tokenExpires:{
        type:Date,
        select:false
    },  
    senha:{
        type:String,
        required:true,
    },
    cel:{
        type:String,
        required:true, 
        unique:true
    }
})

mongoose.model("Usuario", Usuario)
