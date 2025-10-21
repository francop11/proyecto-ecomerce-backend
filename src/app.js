const express = require("express") //treamos express
const handlebars = require("express-handlebars")//treamos los handlebars
const app = express() // iniciamos expres en la variable app
const http = require("http").createServer(app) // creamos un servidor http usando Express
const io = require("socket.io")(http) // iniciamos Socket con el servidor http
const path = require("path")//importamos path para trabajar con rutas de archivos
const ProductManager = require("./dao/productManager")//traemos el product manager
const productManager = new ProductManager(path.join(__dirname, "data/productos.json")) // manejamos los productos desde el archivo json
const port = 8080 // puerto donde va a correr el servidor


// importamos routers 
const productsRouter = require("./routes/products.router")
const cartsRouter = require('./routes/carts.router')
const realtimeRouter = require('./routes/realtimeproducts')

// middlewares para procesar datos entrantes y servir archivos estáticos
app.use(express.static(path.join(__dirname,"../public/"))) // carpeta pública para archivos estáticos
app.use(express.json()) // para interpretar jSON en las peticiones
app.use(express.urlencoded({ extended: true })) // para interpretar datos enviados desde formularios

// Configuración de handlebars
app.engine("handlebars",handlebars.engine()) 
app.set("views",__dirname + "/views") // carpeta donde estarán las vistas 
app.set("view engine","handlebars") // establecemos handlebars como motor de vistas

// usamos los routers importados
app.use("/api/products", productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/', realtimeRouter)

// configuración de sockets para comunicación en tiempo real
io.on("connection", async (socket) => {
  // al conectarse un cliente mostramos la lista de productos
  try {
    const productos = await productManager.getProducts();
    socket.emit("productosList", productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }

  // escuchamos cuando el cliente agrega un producto nuevo
  socket.on("nuevoProducto", async (producto) => {
    try {
      await productManager.addProduct(producto); // guardamos el nuevo producto
      const productosActualizados = await productManager.getProducts(); // obtenemos la lista actualizada
      io.emit("productosList", productosActualizados); // enviamos la lista actualizada
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  })

  // escuchamos cuando el cliente quiere eliminar un producto
  socket.on("eliminarProducto", async (id) => {
    try {
      await productManager.deleteProduct(id); // eliminamos el producto con el id 
      const productosActualizados = await productManager.getProducts(); // obtenemos la lista actualizada
      io.emit("productosList", productosActualizados); // emitimos la lista actualizada 
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  });

});

// inicimoas el servidor http en el puerto definido
http.listen(port, () => {
  console.log("server corriendo en puerto " + port)
})
