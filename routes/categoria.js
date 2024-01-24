const express = require('express');
const router = express.Router();
require('../models/Comentario');
require('../models/Postagem');
require('../models/Categoria');
require('../models/Usuario');
const mongoose = require('mongoose');  
const Postagem = mongoose.model('Postagem');
const Categoria = mongoose.model('Categoria');
const Usuario = mongoose.model('Usuario');  // Ajuste o nome do modelo para 'Usuario'
const Comentario = mongoose.model('Comentario');
const {eUser} = require('../helpers/eUser');


router.get("/", (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias");
        res.redirect('/');
    })
});
router.get('/posts/:slug', (req,res)=>{
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

router.get('/postCompleto/:id', eUser, async (req, res) => {
        Postagem.findOne({ _id: req.params.id }).then((postagem)=>{
        Comentario.find({ post: req.params.id }).populate('user').then((comentarios)=>{
        console.log(res.locals.user);
        if(res.locals.user.eAdmin===1){
            res.render("categorias/postC", { postagem, comentarios, admin: res.locals.user});
        }else{
            res.render("categorias/postC", { postagem, comentarios});
        }
        
    }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar postagem!");
            return res.redirect("/");
        });

      });

});

module.exports = router;