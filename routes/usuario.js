const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/usuario');
const Usuario = mongoose.model('Usuarios');
require('../models/Comentario');
const Comentario = mongoose.model('Comentario')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuario/cadastro');
});

router.post('/registrar', async (req, res) => {
    var erros = [];
    const regexEmail = /^\S+@\S+\.\S+$/;

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido!" });
    }
    if (!req.body.email || typeof req.body.email === "undefined" || req.body.email === null) {
        erros.push({ texto: "Email é obrigatório!" });
    } else if (!regexEmail.test(req.body.email)) {
        erros.push({ texto: "Email inválido!" });
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ||
        !req.body.senhacf || typeof req.body.senhacf == undefined || req.body.senhacf == null) {
        erros.push({ texto: "Senha inválida!" });
    }
    if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null) {
        erros.push({ texto: "Telefone inválido!" });
    }
    if (req.body.nome.length < 3) {
        erros.push({ texto: "Nome muito curto!" });
    }
    if (req.body.senha.length < 8) {
        erros.push({ texto: "Senha muito curta! (Mínimo 8 caracteres)" });
    }
    if (req.body.senha !== req.body.senhacf) {
        erros.push({ texto: "As senhas não conferem!" });
    }

    if (erros.length > 0) {
        res.render("usuario/cadastro", { erros: erros });
    } else {
        try {
            const emailExists = await Usuario.findOne({ email: req.body.email });
            const usernameExists = await Usuario.findOne({ nome: req.body.nome });
            const celExists = await Usuario.findOne({ cel: req.body.telefone });

            if (emailExists) {
                req.flash("error_msg", "Já existe uma conta com esse email!");
                res.redirect("/usuarios/registro");
            } else if (usernameExists) {
                req.flash("error_msg", "Já existe uma conta com esse username!");
                res.redirect("/usuarios/registro");
            } else if (celExists) {
                req.flash("error_msg", "Já existe uma conta com esse celular!");
                res.redirect("/usuarios/registro");
            } else {
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
        } catch (err) {
            req.flash("error_msg", "Houve um erro interno!");
            res.redirect("/usuarios/registro");
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
