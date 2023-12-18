// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser'); // Apenas uma importação
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
// Configuração

//config sessão
app.use(session({
    secret:"secretTest",
    resave: true,
    saveUninitialized:true    
}))
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
mongoose.connect('mongodb://localhost/blogapp').then(()=>{
    console.log('Conected to database');
}).catch((err) => {
    console.log('Error to connect to mongodb:' + err)
})
// Rotas
app.use('/admin', admin);

// Outros
const PORT = 8084;

app.listen(PORT, () => {
    console.log("running on: localhost:" + PORT);
});

app.use((req, res, next)=>{
    res.locals.success = req.flash("sucess");
    res.locals.error = req.flash("error");
    next();
})

//arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
//utilizamos o dirname para pegar o caminho absoluto para o diretorio