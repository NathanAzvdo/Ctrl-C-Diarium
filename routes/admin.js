const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model("Categorias");

//routes
router.get('/', (req, res) => {
    res.render("admin/index")
})
router.get('/posts', (req, res) => {
    res.send("Página de posts")
})
router.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) =>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) =>{
        req.flash("erro_msg", "Houve um erro ao listar as categorias!")
        res.redirect("/admin")
    })
})
router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategoria");
})
router.post('/categorias/new', (req, res)=> {
    var erros =[];
    
    if(!req.body.Name || typeof req.body.Name == undefined || req.body.Name == null){
        erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.Slug || typeof req.body.Slug == undefined || req.body.Slug == null){
        erros.push({texto: "Slug inválido!"})
    }
    if(req.body.Name.lenght < 2){
        erros.push({texto: "Nome muito curto!"})
    }
    if(erros.length>0){
        res.render("admin/addcategoria", {erros: erros})
    }
    else{

        const newCat = {
            nome: req.body.Name,
            slug: req.body.Slug
        }
        new Categoria(newCat).save().then(()=>{
            req.flash("sucess_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err)=>{
            req.flash("erro_msg", "Erro ao salvar categoria, tente novamente!");
            console.log(err);
        })
    }
})


//exports routes to app.js
module.exports = router;