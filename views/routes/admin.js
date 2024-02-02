const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {eAdmin} = require('../../helpers/eAdmin');
require('../../models/Categoria');
const Categoria = mongoose.model("Categoria");
require('../../models/Postagem');
const Postagem = mongoose.model("Postagem");
require('../../models/Comentario');
require('../../models/ComentarioReportado');
const Report = mongoose.model('ComentarioReportado')
const Comentario = mongoose.model('Comentario')
//routes

router.get('/', eAdmin, function(req, res){
    Report.find()
        .populate('Comentario')
        .populate('UserReport')
        .populate('Postagem')
        .then((reportado) => {
            res.render("admin/index", { reportado: reportado });
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao carregar página de adm");
            res.redirect('/');
        });
});


router.get('/posts/add', eAdmin,  function(req, res){
    Categoria.find().then((categorias)=>{
        res.render('admin/addposts', {categorias:categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário!");
        res.redirect("/admin/posts")
    })
});

router.post('/posts/new', eAdmin, function(req, res){
    const erros = [];

    const validations = {
        Title:{
            condition: !req.body.Title || req.body.Title.length < 3, message: "Título inválido!"
        },
        Slug:{
            condition: !req.body.Slug, message: "Slug inválido!"
        },
        Cont:{
            condition: !req.body.Cont || req.body.Cont < 10, message: "Conteúdo inválido!"
        },
        Desc:{
            condition: !req.body.Desc || req.body.Desc.length < 5, message: "Descrição inválida!"
        },
        Categoria:{condition: req.body.Categoria === "0", message: "Registre uma categoria!"
        }
    };

    Object.entries(validations).forEach(([field, { condition, message }]) => {
        if (condition) {
            erros.push({ texto: message });
        }
    });

    if (erros.length > 0) {
        res.render("admin/addposts", { erros: erros });
    } else {
        const newPosts = {
            titulo: req.body.Title,
            descricao: req.body.Desc,
            conteudo: req.body.Cont,
            slug: req.body.Slug,
            categoria: req.body.cat
        };

        new Postagem(newPosts).save().then(() => {
            req.flash("success_msg", "Postagem salva com sucesso!");
            res.redirect("/admin/posts");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar postagem, tente novamente!");
            res.redirect("/admin/posts");
        });
    }
});


router.get('/categorias', eAdmin, function(req, res){
    Categoria.find().then((categorias) =>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as categorias!")
        res.redirect("/admin")
    })
})
router.get('/posts', eAdmin, function(req, res){
    Postagem.find().populate("categoria").then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias!");
        res.render("admin/postagens");
    })
    
    
})
router.get('/posts/remove/:id', eAdmin, async function(req,res){
    Postagem.findByIdAndDelete(req.params.id).then(()=>{
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect('/admin/posts');
    }).catch((err)=>{
        req.flash("error_msg", "Não foi possível deletar a categoria!");
        res.redirect('/admin/posts');
    }); 
});

router.post('/delComment/:id', eAdmin, async function(req, res) {
    try {
        const comentarioId = req.params.id;
        const reportado = await Report.findOne({ Comentario: comentarioId });
        if (reportado) {
            await Report.findByIdAndDelete(reportado._id);
        }
        await Comentario.findByIdAndDelete(comentarioId);

        req.flash("success_msg", "Comentário e relatório (se existir) deletados com sucesso!");
        res.redirect("/categorias/postCompleto/" + req.body.post);
    } catch (err) {
        req.flash("error_msg", "Erro ao deletar comentário");
        res.redirect("/categorias/postCompleto/" + req.body.post);
    }
});


router.post('/delCommentIndex/:id', eAdmin, async function(req, res) {
    try {
        const reportado = await Report.findOneAndDelete({ _id: req.params.id });
        
        if (!reportado) {
            req.flash("error_msg", "Erro ao deletar comentário");
            res.redirect("/admin/");
            return;
        }

        const comentarioId = reportado.Comentario;

        await Comentario.findByIdAndDelete(comentarioId);

        req.flash("success_msg", "Comentário deletado com sucesso!");
        res.redirect("/admin/");
    } catch (err) {
        req.flash("error_msg", "Erro ao deletar comentário");
        res.redirect("/admin/");
    }
});


router.get('/categorias/remove/:id', eAdmin, async function(req, res){
    Categoria.findByIdAndDelete(req.params.id).then(function(){
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect("/admin/categorias");
    }).catch(function(){
            req.flash("error_msg", "Não foi possível deletar a categoria!");
            res.redirect("/admin/categorias");
        })
    });


router.get('/categorias/edit/:id', eAdmin, function(req,res){
    Categoria.findOne({_id:req.params.id}).then((categoria)=>{
        res.render('admin/editar', {categoria: categoria});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao editar categoria, tente novamente!");
        res.redirect("/admin/categorias");
    });
})

router.get('/posts/edit/:id', eAdmin, function(req,res){
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

router.get('/categorias/add', eAdmin, function(req, res){
    res.render("admin/addcategoria");
})

router.post('/categorias/edit', eAdmin, function(req, res){
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

router.post('/posts/edit', eAdmin, function(req,res){
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

router.post('/categorias/new', eAdmin, function(req, res){
    var erros =[];

    const validations = {
        Name:{
            condition: !req.body.Name || req.body.Name.length < 2, message: "Nome inválido!"
        },
        Slug:{
            condition: !req.body.Slug, message: "Slug inválido"
        }
    }
    
    Object.entries(validations).forEach(([field, {condition, message}])=>{
        if(condition){
            erros.push({texto:message})
        }
    })
    
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

module.exports = router;