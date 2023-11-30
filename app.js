//loading modules
const express = require('express');
const handlebars = require('express-handlebars');
const bodyparser = require('body-parser');
const bodyParser = require('body-parser');
const app = express();
//const moongose = require('mongoose');

//config
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json);

    app.engine('handlebars', handlebars.engine({
        defaultLayout: 'main',
        runtimeOptions: {
          allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        }
    }));
    app.set('view engine', 'handlebars');
//routes(temporary)

//others
const PORT = 3306;

app.listen(PORT, ()=>{
    console.log("rodando na porta: "+PORT);
})

