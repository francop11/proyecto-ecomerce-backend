const express = require('express')
const router = express.Router()
const ProductManager=require("../dao/productManager")

const productManager= new ProductManager("../data/productos.json")

router.get('/', async (req, res) => {
  try {
    const productos = await productManager.getProducts()
    res.render('realtimeproducts', {productos });
  } catch (error) {
    res.status(500).send('Error al cargar productos');
  }
})

module.exports = router