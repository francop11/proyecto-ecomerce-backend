const express = require("express") // importamos express para crear el servidor web



const port = 8080 // puerto donde va a correr el servidor

const app = express() // iniciamos express en la variable app

// importamos el router de productos 
const productsRouter = require("./routes/products.router");

const cartsRouter = require('./routes/carts.router');


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

// usamos el router para las rutas de productos 
app.use("/api/products", productsRouter)
app.use('/api/carts', cartsRouter)


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
