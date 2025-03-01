class Producto {
  constructor(id, nombre, precio, imagen, descripcion) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.imagen = imagen;
    this.descripcion = descripcion;
  }
}

class Carrito {
  constructor() {
    this.productos = [];
  }

  agregarProducto(producto) {
    this.productos.push(producto);
  }

  eliminarProducto(id) {
    this.productos = this.productos.filter((producto) => producto.id !== id);
  }

  calcularTotal() {
    return this.productos.reduce(
      (total, producto) => total + producto.precio,
      0
    );
  }
}

const carrito = new Carrito();

async function cargarProductos() {
  try {
    const response = await fetch("https://fakestoreapi.com/products?limit=6");

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const data = await response.json();

    const productos = data.map(
      (item) =>
        new Producto(
          item.id,
          item.title,
          item.price,
          item.image,
          item.description
        )
    );

    mostrarProductos(productos);
  } catch (error) {
    console.error("Error:", error);

    Swal.fire({
      title: "Error",
      text: "No se pudieron cargar los productos. Intente nuevamente más tarde.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}

function mostrarProductos(productos) {
  const contenedor = document.getElementById("productos-container");

  contenedor.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = "Nuestros Productos";
  contenedor.appendChild(titulo);

  const productosGrid = document.createElement("div");
  productosGrid.className = "productos-grid";

  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "producto-card";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${producto.precio.toFixed(2)}`;

    const boton = document.createElement("button");
    boton.textContent = "Agregar al carrito";
    boton.className = "btn-agregar";

    boton.addEventListener("click", () => agregarAlCarrito(producto)) /
      card.appendChild(imagen);
    card.appendChild(nombre);
    card.appendChild(precio);
    card.appendChild(boton);

    productosGrid.appendChild(card);
  });

  contenedor.appendChild(productosGrid);
}

function agregarAlCarrito(producto) {
  carrito.agregarProducto(producto);

  Swal.fire({
    title: "¡Producto agregado!",
    text: `${producto.nombre} se ha agregado al carrito`,
    icon: "success",
    confirmButtonText: "Continuar",
    timer: 2000,
    timerProgressBar: true,
  });

  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("carrito-contador");
  if (contador) {
    contador.textContent = carrito.productos.length;
  }
}

function manejarEnvioFormulario() {
  const formulario = document.getElementById("contactForm");

  if (formulario) {
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("email").value;
      const mensaje = document.getElementById("mensaje").value;

      const datosFormulario = {
        nombre,
        email,
        mensaje,
      };

      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datosFormulario),
          }
        );

        if (!response.ok) {
          throw new Error("Error al enviar el formulario");
        }

        const data = await response.json();
        console.log("Respuesta:", data);

        Swal.fire({
          title: "¡Mensaje enviado!",
          text: "Gracias por contactarnos. Te responderemos pronto.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        formulario.reset();
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo enviar el formulario. Intente nuevamente más tarde.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    });
  }
}

function inicializar() {
  cargarProductos();

  manejarEnvioFormulario();

  const btnVerCarrito = document.createElement("button");
  btnVerCarrito.textContent = "Ver Carrito";
  btnVerCarrito.className = "btn-carrito";
  btnVerCarrito.addEventListener("click", mostrarCarrito);

  const header = document.querySelector("header");
  if (header) {
    header.appendChild(btnVerCarrito);
  }
}

function mostrarCarrito() {
  if (carrito.productos.length === 0) {
    Swal.fire({
      title: "Carrito vacío",
      text: "No hay productos en el carrito",
      icon: "info",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const productosHTML = carrito.productos
    .map(
      (producto) => `
          <div class="carrito-item">
              <img src="${producto.imagen}" alt="${producto.nombre}" width="50">
              <div>
                  <h4>${producto.nombre}</h4>
                  <p>$${producto.precio.toFixed(2)}</p>
              </div>
          </div>
      `
    )
    .join("");

  Swal.fire({
    title: "Tu Carrito",
    html: `
              <div class="carrito-contenido">
                  ${productosHTML}
                  <div class="carrito-total">
                      <strong>Total: $${carrito
                        .calcularTotal()
                        .toFixed(2)}</strong>
                  </div>
              </div>
          `,
    confirmButtonText: "Finalizar Compra",
    showCancelButton: true,
    cancelButtonText: "Seguir Comprando",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "¡Compra realizada!",
        text: "Gracias por tu compra",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      carrito.productos = [];
      actualizarContadorCarrito();
    }
  });
}

document.addEventListener("DOMContentLoaded", inicializar);

import Swal from "sweetalert2";
