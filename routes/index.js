const express = require('express');
const router = express.Router();
require('../models/Postagem');
const mongoose = require('mongoose')
const Postagem = mongoose.model('Postagem');

router.get('/', (req, res)=>{
    Postagem.find().populate("categoria").sort({ data: 'desc' }).limit(5)
    .then((postagens) => {
        res.render('index', { postagens: postagens });
    })
    .catch((err) => {
        res.status(404).send('Erro 404: Página não encontrada');
    });    
})

module.exports = router;