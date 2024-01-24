const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const categorias = require('./routes/categoria')
const usuarios =require('./routes/usuario');
const index = require('./routes/index');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require("./config/auth")(passport);



require('./models/Comentario');
require('./models/Postagem');
require('./models/Categoria');
require('./models/Usuario');  // Certifique-se de registrar o modelo de usuário corretamente
const Postagem = mongoose.model('Postagem');
const Categoria = mongoose.model('Categoria');
const Usuario = mongoose.model('Usuario');  // Ajuste o nome do modelo para 'Usuario'
const Comentario = mongoose.model('Comentario')

app.use(session({
    secret:"secretTest",
    resave: true,
    saveUninitialized:true, 
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));

const hbs = handlebars.create({});
hbs.handlebars.registerHelper('isAdmin', function(user, options) {
  if (user && user.eAdmin === 1) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.set('view engine', 'handlebars');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp').then(()=>{
    console.log('Conected to database');
}).catch((err) => {
    console.log('Error to connect to mongodb:' + err)
})

app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
})


app.use(express.static(path.join(__dirname, "public")));



app.use('/', index);
app.use('/admin', admin);
app.use('/usuarios', usuarios)
app.use('/categorias', categorias)


// Outros

const PORT = 8084;

app.listen(PORT, () => {
    console.log("running on: localhost:" + PORT);
});

