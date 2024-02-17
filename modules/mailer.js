const nodemailer = require('nodemailer');
const { host, port, user, pass} = require('../config/mail.json');
const hbs = require('nodemailer-express-handlebars');
const path = require('path')

var transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
  });

  transport.use('compile', hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve(__dirname, '../resources/mail/') // Corrigindo o caminho
    },
    viewPath: path.resolve(__dirname, '../resources/mail'), // Caminho absoluto
    extName: '.handlebars',
  }));
  
  

module.exports = transport