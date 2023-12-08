const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Categoria = new Schema({
    nome: {
        type: String,
        required: TRUE
    },
    slug: {
        type: String,
        required: TRUE
    },
    date:{
        type:date,
        default: Date.now()
    }
})

mongoose.model("Categorias", Categoria)