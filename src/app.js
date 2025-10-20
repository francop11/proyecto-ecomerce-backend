const express = require("express")
const handlebars = require("express-handlebars")
const app = express() // iniciamos express en la variable app
const http = require("http").createServer(app) // ✅ luego usamos app
const io = require("socket.io")(http)
const ProductManager = require("./dao/productManager");
const productManager = new ProductManager("./data/productos.json")

const port = 8080 // puerto donde va a correr el servidor



// importamos el router de productos 
const productsRouter = require("./routes/products.router")

const cartsRouter = require('./routes/carts.router')

const realtimeRouter = require('./routes/realtimeproducts')
const path = require("path")

// middleware para parsear json y datos url de las solicitudes entrantes
app.use(express.static(path.join(__dirname,"/public/")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.engine("handlebars",handlebars.engine())

app.set("views",__dirname + "/views")
app.set("view engine","handlebars")


 


// usamos el router para las rutas de productos 
app.use("/api/products", productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/', realtimeRouter)

io.on("connection", async (socket) => {
  try {
    const productos = await productManager.getProducts();
    socket.emit("productosList", productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }

  socket.on("nuevoProducto", async (producto) => {
    try {
      await productManager.addProduct(producto);
      const productosActualizados = await productManager.getProducts();
      io.emit("productosList", productosActualizados);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  });
});

// levantamos el servidor en el puerto seleccionado
http.listen(port, () => {
  console.log("server corriendo en puerto " + port)
})