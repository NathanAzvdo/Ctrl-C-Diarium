const localStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const passport = require('passport');

//model usuário
require("../models/usuario");
const Usuario = mongoose.model("Usuarios");

module.exports = function(passport){
    
    
    passport.use(new localStrategy({usernameField:'email', passwordField:'senha'}, (email, senha, done)=>{
        
        Usuario.findOne({email: email}).then((user)=>{
            if(!user){
                return done(null, false, {message: "Esta conta não existe!"})
            }
            bcrypt.compare(senha, user.senha, (erro, batem)=>{
                if(batem){
                    return done(null, user);
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })

        }).catch((err)=>{

        })
    }))

    passport.serializeUser((usuario,done)=>{
        done(null,usuario.id)
    })
    
    passport.deserializeUser((id,done)=>{
        Usuario.findById(id).then((usuario)=>{
            done(null,usuario)
        }).catch((err)=>{
             done (null,false,{message:'algo deu errado'})
        });
    })
    
    



}