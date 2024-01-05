const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model("Categorias");
require('../models/Postagens');
const Postagem = mongoose.model("Postagens");
//routes
router.get('/', (req, res) => {
    res.render("admin/index");
})
router.get('/posts/add', (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('admin/addposts', {categorias:categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário!");
        res.redirect("/admin/posts")
    })
});

router.post('/posts/new', (req, res)=>{
    var erros =[];
    
    if(!req.body.Title || typeof req.body.Title == undefined || req.body.Title == null){
        erros.push({texto: "Nome inválido!"})
    }
    if(!req.body.Slug || typeof req.body.Slug == undefined || req.body.Slug == null){
        erros.push({texto: "Slug inválido!"})
    }
    if(!req.body.Cont || typeof req.body.Cont == undefined || req.body.Cont == null){
        erros.push({texto: "Conteúdo inválido!"})
    }
    if(!req.body.Desc || typeof req.body.Desc == undefined || req.body.Desc == null){
        erros.push({texto: "Descrição inválida!"})
    }
    if(req.body.Title.length < 3){
        erros.push({texto: "Título muito curto!"})
    }
    if(req.body.Cont < 10){
        erros.push({texto: "Conteúdo muito curto!"})

    }
    if(req.body.Categoria=="0"){
        erros.push("Registre uma categoria!")
    }
    if(req.body.Desc > 5){
        erros.push("Descrição muito curta!");
    }
    if(erros.length>0){
        res.render("admin/addposts", {erros: erros})
    }
    
    else{
        const newPosts = {
            titulo: req.body.Title,
            descricao: req.body.Desc,
            conteudo: req.body.Cont,
            slug: req.body.Slug,
            categoria: req.body.cat
        }
        new Postagem(newPosts).save().then(()=>{
            req.flash("success_msg", "Postagem salva com sucesso!");
            res.redirect("/admin/posts");
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao salvar postagem, tente novamente!")
            res.redirect("/admin/posts")
        })
    }
})

router.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) =>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as categorias!")
        res.redirect("/admin")
    })
})
router.get('/posts', (req, res) => {
    Postagem.find().populate("categoria").then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias!");
        res.render("admin/postagens");
    })
    
    
})
router.get('/posts/remove/:id', async(req,res)=>{
    const id = req.params.id;

    try{
        const resultEx = await Postagem.findByIdAndDelete(id);

        if(resultEx){
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect('/admin/posts');
        }else {
            req.flash("error_msg", "Não foi possível deletar a categoria!");
            res.redirect('/admin/posts');
        } 
    } catch (erro) {
        console.error('Erro ao deletar categoria:', erro);
        req.flash("error_msg", "Erro ao deletar categoria!");
        res.redirect("/admin/categorias");
    }
    });

router.get('/categorias/remove/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const resultadoExclusao = await Categoria.findByIdAndDelete(id);

        if (resultadoExclusao) {
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect("/admin/categorias");
        } else {
            req.flash("error_msg", "Não foi possível deletar a categoria!");
            res.redirect("/admin/categorias");
        }
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
        req.flash("error_msg", "Erro ao editar categoria, tente novamente!");
        res.redirect("/admin/categorias");
    });
})

router.get('/posts/edit/:id', (req,res)=>{
    Categoria.find().then((categorias)=>{
        Postagem.findOne({_id:req.params.id}).then((postagem)=>{
            res.render('admin/editarPost', {postagem: postagem, categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao editar postagem, tente novamente!");
            res.redirect("/admin/posts")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário!");
        res.redirect("/admin/posts")
    })
    
    
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
router.post('/posts/edit', (req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        if(!postagem){
            req.flash("error_msg", "Postagem não encontrada para edição");
            return res.redirect("/admin/posts");
        }
        postagem.titulo = req.body.Title;
        postagem.descricao = req.body.Desc;
        postagem.slug = req.body.Slug;
        postagem.conteudo = req.body.Cont;
        postagem.categoria = req.body.cat;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect("/admin/posts");
        }).catch((err)=>{
            req.flash("erro_msg", "Não foi possível editar a postagem!");
            res.redirect("/admin/posts");
        })
    })
})

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