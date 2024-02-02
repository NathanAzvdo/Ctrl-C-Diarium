const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComentarioReportado = new Schema({
    Comentario:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comentario',
        required:true, 
    },
    UserReport:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Usuario',
         required:true 
    },
    NumerosReports:{
        type:Number,
        default:1
    },
    Postagem:{
        type: mongoose.Schema.Types.ObjectId, // Correção aqui
        ref:'Postagem',
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
})

mongoose.model("ComentarioReportado", ComentarioReportado);
