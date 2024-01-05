const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagens = new Schema({
    titulo:{
        type: String,
        required:true
    }, 
    slug:{
        type:String,
        required:true
    },
    descricao:{
        type:String,
        required:true
    },
    conteudo:{
        type:String,
        required:true
    },
    categoria:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:"Categorias", 
        required:true
    },
    date:{
        type:Date, 
        default:Date.now
    }
})
mongoose.model("Postagens", Postagens);