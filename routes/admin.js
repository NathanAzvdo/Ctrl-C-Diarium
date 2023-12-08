const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model("Categorias");

//routes
router.get('/', (req, res) => {
    res.render("admin/index")
})
router.get('/posts', (req, res) => {
    res.send("Página de posts")
})
router.get('/categorias', (req, res) => {
    res.render('admin/categorias')
})
router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategoria");
})
router.post('/categorias/new', (req, res)=> {
    const newCat = {
        nome: req.body.Name,
        slug: req.body.Slug
    }
    new Categoria(newCat).save().then(()=>{
        console.log("Category saved successfully")
    }).catch((err)=>{
        console.log("error saving category in mongodb! "+ err)
    })
})


//exports routes to app.js
module.exports = router;