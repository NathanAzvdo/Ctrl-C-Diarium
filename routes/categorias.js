const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model("Categorias");
require('../models/Postagens');
const Postagem = mongoose.model("Postagens");


router.get("/categorias", (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias");
        res.redirect('/');
    })
});
router.get('/categorias/posts/:slug', (req,res)=>{
    Categoria.findOne({slug:req.params.slug}).then((categoria)=>{
        if(categoria){
            Postagem.find({categoria:categoria._id}).then((postagens)=>{
                res.render("categorias/postagens", {categoria:categoria, postagens:postagens})
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao carregar postagens")
                res.render("categorias/index")
            });  
        }else{
            req.flash("error_msg", "Essa categoria não existe");
            res.redirect("/categorias/")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria!");
        res.redirect("/categorias");
    })
})

router.get('/categorias/postCompleto/:id', (req, res)=>{    
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
        res.render("categorias/postC", {postagem: postagem})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar postagem")
        res.redirect("categorias/posts")
    })
});

module.exports = router;