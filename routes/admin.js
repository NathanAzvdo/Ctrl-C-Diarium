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
        req.flash("error_msg", "Houve um erro ao listar as categorias!")
        res.redirect("/admin")
    })
})


router.get('/categorias/remove/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const resultadoExclusao = await Categoria.findByIdAndDelete(id);

        if (resultadoExclusao) {
            req.flash("success_msg", "Categoria deletada com sucesso!");
        } else {
            req.flash("error_msg", "Não foi possível deletar a categoria!");
        }

        const categorias = await Categoria.find(); // ou qualquer lógica para obter a lista atualizada de categorias

        res.render('admin/categorias', { categorias });
    } catch (erro) {
        console.error('Erro ao deletar categoria:', erro);
        req.flash("error_msg", "Erro ao deletar categoria!");
        res.redirect("/admin/categorias");
    }
});

router.get('/categorias/edit/:id', (req,res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria)=>{
        res.render('admin/editar', {categoria: categoria});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao editar categoria, tente novamente");
        res.redirect("/admin/categorias");
    });
})

router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategoria");
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        if (!categoria) {
            req.flash("error_msg", "Categoria não encontrada para edição");
            return res.redirect("/admin/categorias");
        }

        categoria.nome = req.body.Name;
        categoria.slug = req.body.Slug;

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria, tente novamente!");
            res.redirect("/admin/categorias");
        });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar categoria, tente novamente!");
        res.redirect("/admin/categorias");
    });
});

router.post('/categorias/new', (req, res)=> {
    var erros =[];
    
    if(!req.body.Name || typeof req.body.Name == undefined || req.body.Name == null){
        erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.Slug || typeof req.body.Slug == undefined || req.body.Slug == null){
        erros.push({texto: "Slug inválido!"})
    }
    if(req.body.Name.length < 2){
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
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao salvar categoria, tente novamente!");
            res.redirect("/admin/categorias")
        })
    }
})


//exports routes to app.js
module.exports = router;