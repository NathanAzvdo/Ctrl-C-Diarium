const express = require('express');
const router = express.Router();
require('../../models/Comentario');
require('../../models/Postagem');
require('../../models/Categoria');
require('../../models/Usuario');
const mongoose = require('mongoose');  
const Postagem = mongoose.model('Postagem');
const Categoria = mongoose.model('Categoria');
const Usuario = mongoose.model('Usuario');  // Ajuste o nome do modelo para 'Usuario'
const Comentario = mongoose.model('Comentario');
const {eUser} = require('../../helpers/eUser');


router.get("/", eUser, function(req, res){
    Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias");
        res.redirect('/');
    })
});
router.get('/posts/:slug', eUser, function(req,res){
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
router.get('/posts', eUser, function(req,res){

    Postagem.find().then((postagens)=>{
        res.render("categorias/postagens", {postagens:postagens})
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao carregar postagens")
        res.render("categorias/index")
    });  
       
})

router.get('/postCompleto/:id', eUser, async function(req, res){
    Postagem.findOne({ _id: req.params.id }).then((postagem)=>{
        Comentario.find({ post: req.params.id }).populate('user').then((comentarios)=>{
            res.render("categorias/postC", { postagem, comentarios, adm: res.locals.adm});  
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar Categoria!");
            return res.redirect("/");
        });

    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar postagem!");
        return res.redirect("/");
    });

});

module.exports = router;