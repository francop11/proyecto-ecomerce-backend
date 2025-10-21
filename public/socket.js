const socket = io()

// escuchamos el evento productosList que nos envía la lista actualizada desde el servidor
socket.on("productosList", (productos) => {
  renderProductos(productos)
})

// funcion para mostar los productos
function renderProductos(productos) {
  // seelccionamos el div para mostrar los productos
  const productosActualizados = document.querySelector("#productosActualizados")
  // vaciamos el div para evitar duplicados
  productosActualizados.innerHTML = ""

  //iteramos cada producto y creamos un li con un boton para eliminar
  productos.forEach(product => {
    const li = document.createElement("li")
    li.textContent = product.title + " - Precio: $" + product.price

    // creamos el botón eliminar para cada producto
    const btnEliminar = document.createElement("button")
    btnEliminar.textContent = "Eliminar"
    // al hacer click eliminamos el producto con el id correspondiente
    btnEliminar.addEventListener("click", () => {
      socket.emit("eliminarProducto", product.id)
    })

    // agregamos el boton eliminar al li y luego agregamos el li a la lista
    li.appendChild(btnEliminar)
    productosActualizados.appendChild(li)
  })
}

// seleccionamos el formulario 
const form = document.querySelector("#formNuevoProducto")

// escuchamos el evento submit
form.addEventListener("submit", (e) => {
  e.preventDefault() // evitamos que recargue la pagina

  // obtenemos los valores que ingresa el usuario
  const titulo = document.querySelector("#titulo").value
  const precio = document.querySelector("#precio").value
  const precioNum = parseFloat(precio)

  // validamos que los campos esten completos y el numero no sea un string
  if (titulo === "" || isNaN(precioNum)) {
    alert("Por favor completá todos los campos correctamente")
    return
  }

  // emitimos el nuevo producto con los campos seleccionados
  socket.emit("nuevoProducto", { title: titulo, price: precioNum })

  // resetamnos el formulario para limpiar los campos
  form.reset()
})
