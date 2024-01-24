const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/Usuario');
const Usuario = mongoose.model('Usuario');
require('../models/Comentario');
const Comentario = mongoose.model('Comentario')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuario/cadastro');
});

router.post('/registrar', async (req, res) => {
    var erros = [];
    const regexEmail = /^\S+@\S+\.\S+$/;

    const validations = {
        nome: { condition: !req.body.nome || typeof req.body.nome === "undefined" || req.body.nome === null, message: "Nome inválido!" },
        email: { condition: !req.body.email || typeof req.body.email === "undefined" || req.body.email === null || !regexEmail.test(req.body.email), message: "Email inválido!" },
        senha: { condition: !req.body.senha || typeof req.body.senha === "undefined" || req.body.senha === null || !req.body.senhacf || typeof req.body.senhacf === "undefined" || req.body.senhacf === null || req.body.senha.length < 8, message: "Senha inválida ou muito curta!" },
        senha2:{condition: req.body.senha !== req.body.senhacf, message:"As senhas não conferem!"},
        telefone: { condition: !req.body.telefone || typeof req.body.telefone === "undefined" || req.body.telefone === null, message: "Telefone inválido!" },
        nomeLength: { condition: req.body.nome.length < 3, message: "Nome muito curto!" }
    };
    
    Object.entries(validations).forEach(([field, { condition, message }]) => {
        if (condition) {
            erros.push({ texto: message });
        }
    });
    if (erros.length > 0) {
        res.render("usuario/cadastro", { erros: erros });
    } else {
       
            const validations2 ={
                email:{
                    condition: Usuario.findOne({ email: req.body.email }), message: "Email já cadastrado!"
                },
                username:{
                    condition: Usuario.findOne({nome: req.body.nome}), message: "Nome de usuário já registrado"
                },
                cel:{
                    condition: Usuario.findOne({cel: req.body.telefone}), message: "Telefone já registrado"
                }
            }
            
            Object.entries(validations2).forEach(([field, {condition, message}])=>{
                if(condition){
                    erros.push({texto:message})
                }
            })
            if(erros.length >0){
                res.render("usuario/cadastro", {erros: erros})
            }
            else {
                const hashedPassword = await bcrypt.hash(req.body.senha, 10);

                const newUser = {
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: hashedPassword,
                    cel: req.body.telefone,
                };

                new Usuario(newUser).save().then(() => {
                    req.flash("success_msg", "Cadastro feito com sucesso, faça o login.");
                    res.redirect("/");
                }).catch((err) => {
                    req.flash("erro_msg", "Houve um erro ao realizar seu cadastro, tente novamente mais tarde!");
                    res.redirect("/usuarios/registro");
                });
            }
    }
});

router.get("/login", (req, res)=>{
    res.render("usuario/login");
})

router.post('/log', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error_msg', 'Usuário ou senha incorretos.');
            return res.redirect("/usuarios/login");
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            res.locals.user = {username: user._id};
            // Verifica se eAdmin é igual a 1
            if (user.eAdmin === 1) {
                return res.redirect("/admin");
            } else {
                return res.redirect("/");
            }
        });


    })(req, res, next);
});


router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.locals.user = null;
        req.flash('success_msg', 'Deslogado com sucesso!');
        res.redirect("/");
    });
});

router.post('/comment',(req, res) => {
            
    const newComment ={
        conteudo:req.body.cont,
        user: req.body.id,
        post: req.body.idPost
    }
        
    new Comentario(newComment).save().then(()=>{
        req.flash("success_msg", "Comentário adicionado com sucesso");
        res.redirect(req.body.urlInput);
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao adicionar comentário");
        res.redirect(req.body.urlInput);
    })
    
})

module.exports = router;
