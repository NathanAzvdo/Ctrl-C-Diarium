const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comentario = new Schema({
    conteudo:{
        type:String,
        required:true
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Postagem',
        required:true 
    },
    user:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Usuario',
         required:true 
    },
    date:{
        type:Date,
        default:Date.now
    }
})

mongoose.model("Comentario", Comentario);
