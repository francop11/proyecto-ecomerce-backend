const express = require("express") // importamos express para crear el servidor web

// importamos la clase productmanager para manejar productos
const { ProductManager } = require("./dao/productManager") 

const port = 8080 // puerto donde va a correr el servidor

const app = express() // iniciamos express en la variable app

// la variable manager trae el json desde la ruta especificada
const manager = new ProductManager("./src/data/productos.json")

// middleware para parsear json y datos url de las solicitudes entrantes
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// home page con html de bienvenida
app.get("/", (req, res) => {
  let html = `
  <h1>house gamer </h1>
  <hr>
  `
  res.send(html) // con send mostramos la respuesta
})

// endpoint para obtener productos ,filtrando por precio y por cierta cantidad de productos
app.get("/productos", async (req, res) => {
  try {
    const { limit, price } = req.query // parametros de limite y precio para usar las query
    let productos = await manager.getProducts() // traemos los produtcos desde el manager

    // si price esta definidio filtramso los productos
    if (price) {
      const precioFiltro = Number(price) // lo convertimos en formato number
      productos = productos.filter(p => p.price <= precioFiltro)
    }

    // si limit esta definido traemos la cantidad mostrada
    if (limit) {
      productos = productos.slice(0, Number(limit))
    }

    res.json(productos) // traemos todo los productos en formato json

  } catch (error) {
    console.error(" error al obtener productos:", error)
    res.status(500).json({ error: "error al obtener los productos" }) 
  }
})

// ruta a modo de ejemplo para caundo caruemos los productos al carrito
app.get("/carrito", (req, res) => {
  let html = `
  <h1>el carrito esta vacio</h1>
  <hr>
  `
  res.send(html)
})

// levantamos el servidor en el puerto seleccionado
const server = app.listen(port, () => {
  console.log("server corriendo en puerto " + port)
})
