const express = require("express");
const router = express.Router();
require("../../models/Comentario");
require("../../models/Postagem");
require("../../models/Categoria");
require("../../models/Usuario");
require("../../models/ComentarioReportado");
const mongoose = require("mongoose");
const Postagem = mongoose.model("Postagem");
const Report = mongoose.model("ComentarioReportado");
const Categoria = mongoose.model("Categoria");
const Usuario = mongoose.model("Usuario");
const Comentario = mongoose.model("Comentario");
const { eUser } = require("../../helpers/eUser");

router.get("/", eUser, function (req, res) {
  Categoria.find()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao carregar categorias");
      res.redirect("/");
    });
});
router.get("/posts/:slug", eUser, function (req, res) {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then((postagens) => {
            res.render("categorias/postagens", {
              categoria: categoria,
              postagens: postagens,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Erro ao carregar postagens");
            res.render("categorias/index");
          });
      } else {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/categorias/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página dessa categoria!"
      );
      res.redirect("/categorias");
    });
});
router.get("/posts", eUser, function (req, res) {
  Postagem.find()
    .then((postagens) => {
      res.render("categorias/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao carregar postagens");
      res.render("categorias/index");
    });
});

router.get("/postCompleto/:id", eUser, async function (req, res) {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Comentario.find({ post: req.params.id })
        .populate("user")
        .then((comentarios) => {
          res.render("categorias/postC", {
            postagem,
            comentarios,
            adm: res.locals.adm,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao carregar Categoria!");
          return res.redirect("/");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao carregar postagem!");
      return res.redirect("/");
    });
});

router.post("/report/:id", eUser, async function (req, res) {
  const comentarioId = req.params.id;
  const novoUsuarioId = res.locals.user._id;

  Report.find({ Comentario: comentarioId, UserReport: novoUsuarioId })
    .then(async (reports) => {
      if (reports.length > 0) {
        req.flash("error_msg", "Comentário já reportado anteriormente!");
        return res.redirect("/categorias/postCompleto/" + req.body.post);
      } else {
        const rp = await Report.find({ Comentario: comentarioId });

        if (rp.length > 0) {
          const usuariosRegistrados = rp[0].UserReport;
          usuariosRegistrados.push(novoUsuarioId);
          await Report.findByIdAndUpdate(rp[0]._id, {
            UserReport: usuariosRegistrados,
            $inc: { NumerosReports: 1 },
          });
          req.flash("success_msg", "Comentário reportado com sucesso!");
          return res.redirect("/categorias/postCompleto/" + req.body.post);
        } else {
          const newRep = {
            Comentario: comentarioId,
            UserReport: res.locals.user._id,
            Postagem: req.body.post,
          };
          new Report(newRep)
            .save()
            .then(() => {
              req.flash("success_msg", "Comentário reportado com sucesso!");
              return res.redirect("/categorias/postCompleto/" + req.body.post);
            })
            .catch((err) => {
              req.flash("error_msg", "Erro ao reportar comentário!");
              return res.redirect("/categorias/postCompleto/" + req.body.post);
            });
        }
      }
    })
    .catch((err) => {
      console.error("Erro ao encontrar report:", err);
      return res.status(500).send("Erro ao encontrar report.");
    });
});

module.exports = router;
