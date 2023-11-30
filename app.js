// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser'); // Apenas uma importação
const app = express();
const admin = require('./routes/admin');

// Configuração
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');

// Rotas
app.use('/admin', admin);

// Outros
const PORT = 8084;

app.listen(PORT, () => {
    console.log("Rodando na porta: " + PORT);
});
