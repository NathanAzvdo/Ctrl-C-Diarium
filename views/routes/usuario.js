const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("../../models/Usuario");
const Usuario = mongoose.model("Usuario");
require("../../models/Comentario");
const Comentario = mongoose.model("Comentario");
const passport = require("passport");
const crypto = require("crypto");
const transport = require("../../modules/mailer");
const { eUser } = require("../../helpers/eUser");

router.get("/registro", function (req, res) {
  res.render("usuario/cadastro");
});

router.post("/registrar", async function (req, res) {
  var erros = [];
  const regexEmail = /^\S+@\S+\.\S+$/;

  const validations = {
    nome: {
      condition:
        !req.body.nome ||
        typeof req.body.nome === "undefined" ||
        req.body.nome === null,
      message: "Nome inválido!",
    },
    email: {
      condition:
        !req.body.email ||
        typeof req.body.email === "undefined" ||
        req.body.email === null ||
        !regexEmail.test(req.body.email),
      message: "Email inválido!",
    },
    senha: {
      condition:
        !req.body.senha ||
        typeof req.body.senha === "undefined" ||
        req.body.senha === null ||
        !req.body.senhacf ||
        typeof req.body.senhacf === "undefined" ||
        req.body.senhacf === null ||
        req.body.senha.length < 8,
      message: "Senha inválida ou muito curta!",
    },
    senha2: {
      condition: req.body.senha !== req.body.senhacf,
      message: "As senhas não conferem!",
    },
    telefone: {
      condition:
        !req.body.telefone ||
        typeof req.body.telefone === "undefined" ||
        req.body.telefone === null,
      message: "Telefone inválido!",
    },
    nomeLength: {
      condition: req.body.nome.length < 3,
      message: "Nome muito curto!",
    },
  };

  Object.entries(validations).forEach(function ([
    field,
    { condition, message },
  ]) {
    if (condition) {
      erros.push({ texto: message });
    }
  });

  if (erros.length > 0) {
    res.render("usuario/cadastro", { erros: erros });
  } else {
    const validations2 = {
      email: {
        condition: await Usuario.findOne({ email: req.body.email }),
        message: "Email já cadastrado!",
      },
      username: {
        condition: await Usuario.findOne({ nome: req.body.nome }),
        message: "Nome de usuário já registrado",
      },
      cel: {
        condition: await Usuario.findOne({ cel: req.body.telefone }),
        message: "Telefone já registrado",
      },
    };

    Object.entries(validations2).forEach(function ([
      field,
      { condition, message },
    ]) {
      if (condition) {
        erros.push({ texto: message });
      }
    });

    if (erros.length > 0) {
      res.render("usuario/cadastro", { erros: erros });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.senha, 10);

      const newUser = {
        nome: req.body.nome,
        email: req.body.email,
        senha: hashedPassword,
        cel: req.body.telefone,
      };

      new Usuario(newUser)
        .save()
        .then(function () {
          req.flash("success_msg", "Cadastro feito com sucesso, faça o login.");
          res.redirect("/");
        })
        .catch(function (err) {
          req.flash(
            "erro_msg",
            "Houve um erro ao realizar seu cadastro, tente novamente mais tarde!"
          );
          res.redirect("/usuarios/registro");
        });
    }
  }
});

router.get("/login", function (req, res) {
  res.render("usuario/login");
});

router.post("/log", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error_msg", "Usuário ou senha incorretos.");
      return res.redirect("/usuarios/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.locals.user = { username: user._id };

      if (user.eAdmin === 1) {
        return res.redirect("/admin");
      } else {
        return res.redirect("/");
      }
    });
  })(req, res, next);
});

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.locals.user = null;
    req.flash("success_msg", "Deslogado com sucesso!");
    res.redirect("/");
  });
});

router.post("/comment", eUser, function (req, res) {
  const newComment = {
    conteudo: req.body.cont,
    user: req.body.id,
    post: req.body.idPost,
  };

  new Comentario(newComment)
    .save()
    .then(function () {
      req.flash("success_msg", "Comentário adicionado com sucesso");
      res.redirect(req.body.urlInput);
    })
    .catch(function (err) {
      req.flash("error_msg", "Erro ao adicionar comentário");
      res.redirect(req.body.urlInput);
    });
});

router.get("/recuperacao", function (req, res) {
  res.render("usuario/recSenha");
});

router.post("/esquecisenha", async function (req, res) {
  const email = req.body.email;

  try {
    Usuario.findOne({ email: email })
      .then(async (user) => {
        const token = crypto.randomBytes(6).toString("hex");
        const now = new Date();
        now.setHours(now.getHours() + 1);

        user.resetpasstoken = token;
        user.tokenExpires = now;
        await user
          .save()
          .then(() => {
            console.log("token salvo");
          })
          .catch((err) => {
            console.log("erro:" + err);
          });

        transport.sendMail(
          {
            to: email,
            from: "Ctrl+c_diarium@gmail.com",
            template: "/forgot",
            context: { token },
          },
          (err) => {
            if (err) {
              req.flash(
                "error_msg",
                "Erro ao encaminhar mensagem para sua caixa de email, tente novamente!"
              );
              res.redirect("/usuarios/recuperacao");
            }
          }
        );

        res.redirect("/usuarios/verificacaoToken/" + user._id);
      })
      .catch(() => {
        req.flash("error_msg", "Não há conta registrada nesse email!");
        res.redirect("/usuarios/recuperacao");
      });
  } catch {
    res
      .status(400)
      .send({ error: "Erro ao recuperar senha, tente novamente mais tarde!" });
  }
});

router.get("/verificacaoToken/:id", function (req, res) {
  res.render("usuario/verifica", { id: req.params.id });
});

router.post("/resetPass", async function (req, res) {
  const token = req.body.token;
  const id = req.body.id;
  try {
    const now = new Date();
    Usuario.findOne({ _id: id })
      .then((user) => {
        if (token !== user.resetpasstoken) {
          req.flash("error_msg", "Token inválido!");
          res.redirect("/usuarios/verificacaoToken/" + user._id);
        } else if (now > user.tokenExpires) {
          req.flash("error_msg", "Token expirado!");
          res.redirect("/usuarios/verificacaoToken/" + user._id);
        } else {
          res.render("usuario/novasenha", {
            id: user._id,
            token: user.resetpasstoken,
          });
        }
      })
      .catch((err) => {
        res.status(400).send({ error: "Erro, tente novamente mais tarde" });
      });
  } catch {
    res.status(400).send({ error: "Erro, tente novamente mais tarde" });
  }
});

router.post("/newpass", function (req, res) {
  Usuario.findOne({ _id: req.body.id })
    .then(async (user) => {
      if (user.resetpasstoken !== req.body.token) {
        req.flash("error_msg", "Token inválido!");
        res.redirect("/usuarios/verificacaoToken/" + req.params.id);
      } else {
        var erros = [];
        const validations = {
          senha: {
            condition:
              !req.body.senha ||
              typeof req.body.senha === "undefined" ||
              req.body.senha === null ||
              !req.body.senhacf ||
              typeof req.body.senhacf === "undefined" ||
              req.body.senhacf === null ||
              req.body.senha.length < 8,
            message: "Senha inválida ou muito curta!",
          },
          senha2: {
            condition: req.body.senha !== req.body.senhacf,
            message: "As senhas não conferem!",
          },
        };
        Object.entries(validations).forEach(function ([
          field,
          { condition, message },
        ]) {
          if (condition) {
            erros.push({ texto: message });
          }
        });

        if (erros.length > 0) {
          res.redirect("/usuarios/verificacaoToken/" + user._id, {
            erros: erros,
          });
        } else {
          const hashedPassword = await bcrypt.hash(req.body.senha, 10);

          user.senha = hashedPassword;
          user.tokenExpires = null;
          user.resetpasstoken = null;
          user
            .save()
            .then((us) => {
              req.flash("success_msg", "Senha alterada com sucesso!");
              res.redirect("/usuarios/login");
            })
            .catch((err) => {
              req.flash("error_msg", "houve um erro ao alterar sua senha!");
              res.redirect("/");
            });
        }
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Algo deu errado ao redefinir a senha, tente novamente mais tarde!"
      );
      res.redirect("/usuarios/verificacaoToken/" + req.params.id);
    });
});
module.exports = router;
