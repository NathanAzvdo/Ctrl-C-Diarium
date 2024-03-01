const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Chat = new Schema({
    UserSender:{
        type: mongoose.Schema.ObjectId,
        ref:'Usuario'
    },
    UserReceiver:{
        type: mongoose.Schema.ObjectId,
        ref:'Usuario'
    },
    message:{
        type:String,
        required:true
    }
},
{timestamps:true}
)