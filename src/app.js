const express = require("express") // traemos express
const handlebars = require("express-handlebars") // traemos handlebars
const session = require("express-session") // traemos express-session para manejar sesiones
const app = express() // iniciamos express en la variable app
const http = require("http").createServer(app) // creamos un servidor http usando Express
const io = require("socket.io")(http) // iniciamos Socket con el servidor http
const path = require("path") // importamos path para trabajar con rutas de archivos
const { connectMongo } = require("./db/connection") // importamos la conexión a MongoDB

// traemos el product manager que ahora usa MongoDB
const ProductManagerMongo = require("./dao/productManagerDB")
const productManager = new ProductManagerMongo() // manejamos los productos desde la base de datos

const port = 8080 // puerto donde va a correr el servidor

// importamos routers
const productsRouter = require("./routes/products.router")
const cartsRouter = require("./routes/carts.router")
const viewsRouter = require("./routes/views.router") // rutas de las vistas

// middlewares para procesar datos entrantes y servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public/"))) // carpeta pública para archivos estáticos
app.use(express.json()) // para interpretar JSON en las peticiones
app.use(express.urlencoded({ extended: true })) // para interpretar datos enviados desde formularios

// configuración de sesiones
app.use(session({
  secret: "miSecretoSuperSeguro", // cualquier string secreto
  resave: false, // no guardar la sesión si no hay cambios
  saveUninitialized: true, // guardar sesión nueva aunque no tenga datos
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora de duración
}))

// Configuración de handlebars
app.engine("handlebars", handlebars.engine({
  helpers: {
    multiply: (a, b) => a * b,
    eq: (a, b) => a === b // helper para comparar valores (reemplaza ifEquals)
  }
}))
app.set("views", path.join(__dirname, "views")) // carpeta donde estarán las vistas
app.set("view engine", "handlebars") // establecemos handlebars como motor de vistas

// usamos los routers importados
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/", viewsRouter) // vista principal

// configuración de sockets para comunicación en tiempo real
io.on("connection", async (socket) => {
  // al conectarse un cliente mostramos la lista de productos
  try {
    const result = await productManager.getProducts({ limit: 1000, page: 1 }) // obtenemos todos los productos
    const productos = result && result.payload ? result.payload : [] // tomamos el array de productos
    socket.emit("productosList", productos) // enviamos la lista inicial al cliente
  } catch (error) {
    console.error("Error al obtener productos:", error)
    socket.emit("productosList", []) // si falla, enviamos lista vacía
  }

  // escuchamos cuando el cliente agrega un producto nuevo
  socket.on("nuevoProducto", async (producto) => {
    try {
      await productManager.addProduct(producto) // guardamos el nuevo producto en Mongo
      const result = await productManager.getProducts({ limit: 1000, page: 1 }) // obtenemos la lista actualizada
      const productosActualizados = result && result.payload ? result.payload : []
      io.emit("productosList", productosActualizados) // enviamos la lista actualizada
    } catch (error) {
      console.error("Error al agregar producto:", error)
    }
  })

  // escuchamos cuando el cliente quiere eliminar un producto
  socket.on("eliminarProducto", async (id) => {
    try {
      await productManager.deleteProduct(id) // eliminamos el producto por id desde Mongo
      const result = await productManager.getProducts({ limit: 1000, page: 1 }) // obtenemos la lista actualizada
      const productosActualizados = result && result.payload ? result.payload : []
      io.emit("productosList", productosActualizados) // emitimos la lista actualizada
    } catch (error) {
      console.error("Error al eliminar producto:", error)
    }
  })
})

// iniciamos el servidor http en el puerto definido
connectMongo()
  .then(() => {
    http.listen(port, () => {
      console.log("servidor corriendo en puerto " + port)
    })
  })
  .catch((error) => {
    console.error("error al conectar a la base de datos:", error)
    process.exit(1) // si hay error, detenemos la app
  })
