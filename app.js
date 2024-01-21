// Notas do Rubens:
// 1. Sugiro remover os comentários atuais. Eles parecem redundantes com o 
//    código que os segue. Por exemplo, abaixo você diz que está carregando
//    os módulos, mas o código que segue já diz isso por si só.
// 2. Agora sobre a arquitetura do projeto. Ti tá fazendo um MVT. 
//    A ideia aqui é você ter três pastas principais: models, views e templates.
//   Models: Aqui você coloca os modelos do Mongoose. Está perfeito como você fez.
//   Views: Aqui você coloca a camada de lógica que responde às requisições. 
//   O que eu quero dizer, é que essas arrow-functions que você está passando para
//   o app.get() são as views. Sería ideal se você definisse elas na pasta de views
//   e importasse elas aqui.
//   De maneira geral o arquivo app.js deve ser reduzido de maneira que funcione como
//   um orquestrador das requisições. Aqui você configura o cors policy, as rotas,
//   os middlewares, etc. Mas a lógica de fato deve estar nas views.
//   Templates: Aqui você coloca os templates do Handlebars. Que é basicamente o que
//   está na pasta views atualmente.
//   Admito que não saquei tão bem por quê tem rotas definidas tanto aqui quanto 
//   na pasta routes. Mas separar as rotas em outro lugar para o app.js ficar mais
//   limpo é uma coisa considerável a se fazer por vezes.


// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const usuarios = require('./routes/usuario')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require("./config/auth")(passport);
const { eUser } = require('./helpers/eUser');

// Models
require('./models/Comentario');
require('./models/Postagens');
require('./models/Categoria');
require('./models/usuario');  // Certifique-se de registrar o modelo de usuário corretamente
const Postagem = mongoose.model('Postagens');
const Categoria = mongoose.model('Categorias');
const Usuario = mongoose.model('Usuarios');  // Ajuste o nome do modelo para 'Usuario'
const Comentario = mongoose.model('Comentario')
// Configuração

//config sessão
app.use(session({
    secret: "secretTest",
    resave: true,
    saveUninitialized: true,
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//handlebars
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
//mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp').then(() => {
    console.log('Conected to database');
}).catch((err) => {
    console.log('Error to connect to mongodb:' + err)
})

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
})

//arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
//utilizamos o dirname para pegar o caminho absoluto para o diretorio

// Rotas
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({ data: 'desc' }).limit(5)
        .then((postagens) => {
            res.render('index', { postagens: postagens });
        })
        .catch((err) => {
            res.status(404).send('Erro 404: Página não encontrada');
        });



})

app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index', { categorias: categorias });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar categorias");
        res.redirect('/');
    })
});
app.get('/categorias/posts/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).then((postagens) => {
                res.render("categorias/postagens", { categoria: categoria, postagens: postagens })
            }).catch((err) => {
                req.flash('error_msg', "Erro ao carregar postagens")
                res.render("categorias/index")
            });
        } else {
            req.flash("error_msg", "Essa categoria não existe");
            res.redirect("/categorias/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria!");
        res.redirect("/categorias");
    })
})

app.get('/categorias/postCompleto/:id', eUser, async (req, res) => {
    try {
        const postagem = await Postagem.findOne({ _id: req.params.id });
        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada");
            return res.redirect("categorias/posts");
        }

        // Buscar os comentários associados a essa postagem
        const comentarios = await Comentario.find({ post: req.params.id }).populate('user');

        res.render("categorias/postC", { postagem: postagem, comentarios: comentarios });
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Erro ao carregar postagem");
        res.redirect("categorias/posts");
    }
});




app.use('/admin', admin);
app.use('/usuarios', usuarios)

// Outros

const PORT = 8084;

app.listen(PORT, () => {
    console.log("running on: localhost:" + PORT);
});


