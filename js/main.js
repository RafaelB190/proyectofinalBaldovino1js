class Producto {
  constructor(id, nombre, precio, imagen, descripcion, categoria) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.imagen = imagen;
    this.descripcion = descripcion;
    this.categoria = categoria;
  }
}

class ItemCarrito {
  constructor(producto, cantidad = 1) {
    this.producto = producto;
    this.cantidad = cantidad;
  }

  obtenerSubtotal() {
    return this.producto.precio * this.cantidad;
  }
}

class Carrito {
  constructor() {
    this.items = [];
    this.cargarDesdeStorage();
  }

  agregarProducto(producto) {
    const itemExistente = this.items.find(
      (item) => item.producto.id === producto.id
    );

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.items.push(new ItemCarrito(producto));
    }

    this.guardarEnStorage();
  }

  eliminarProducto(id) {
    this.items = this.items.filter((item) => item.producto.id !== id);
    this.guardarEnStorage();
  }

  vaciarCarrito() {
    this.items = [];
    this.guardarEnStorage();
  }

  aumentarCantidad(id) {
    const item = this.items.find((item) => item.producto.id === id);
    if (item) {
      item.cantidad++;
      this.guardarEnStorage();
    }
  }

  disminuirCantidad(id) {
    const item = this.items.find((item) => item.producto.id === id);
    if (item && item.cantidad > 1) {
      item.cantidad--;
      this.guardarEnStorage();
    } else if (item && item.cantidad === 1) {
      this.eliminarProducto(id);
    }
  }

  calcularTotal() {
    return this.items.reduce(
      (total, item) => total + item.obtenerSubtotal(),
      0
    );
  }

  obtenerCantidadTotal() {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  guardarEnStorage() {
    localStorage.setItem("carrito", JSON.stringify(this.items));
  }

  cargarDesdeStorage() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
      try {
        const itemsParseados = JSON.parse(carritoGuardado);
        this.items = itemsParseados.map((item) => {
          const producto = new Producto(
            item.producto.id,
            item.producto.nombre,
            item.producto.precio,
            item.producto.imagen,
            item.producto.descripcion,
            item.producto.categoria
          );
          return new ItemCarrito(producto, item.cantidad);
        });
      } catch (error) {
        console.error("Error al cargar el carrito desde localStorage:", error);
        this.items = [];
      }
    }
  }
}

const carrito = new Carrito();
let todosLosProductos = [];

async function cargarProductos() {
  try {
    const response = await fetch("../assets/data/data.json");

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const data = await response.json();

    todosLosProductos = data.productos.map(
      (item) =>
        new Producto(
          item.id,
          item.nombre,
          item.precio,
          item.imagen,
          item.descripcion,
          item.nombre.toLowerCase().includes("salsa") ? "salsas" : "pastas"
        )
    );

    const paginaActual = window.location.pathname;

    if (paginaActual.includes("productos.html")) {
      mostrarProductosPorCategoria();
    } else {
      mostrarProductosDestacados();
    }

    actualizarContadorCarrito();
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

function mostrarProductosPorCategoria() {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  const filtrosContainer = document.createElement("div");
  filtrosContainer.className = "filtros-container";

  const tituloFiltros = document.createElement("h2");
  tituloFiltros.textContent = "Categorías";
  filtrosContainer.appendChild(tituloFiltros);

  const botonesContainer = document.createElement("div");
  botonesContainer.className = "botones-filtro";

  const btnTodos = document.createElement("button");
  btnTodos.textContent = "Todos";
  btnTodos.className = "btn-filtro activo";
  btnTodos.addEventListener("click", () => {
    document
      .querySelectorAll(".btn-filtro")
      .forEach((btn) => btn.classList.remove("activo"));
    btnTodos.classList.add("activo");
    mostrarProductos(todosLosProductos);
  });

  const btnPastas = document.createElement("button");
  btnPastas.textContent = "Pastas";
  btnPastas.className = "btn-filtro";
  btnPastas.addEventListener("click", () => {
    document
      .querySelectorAll(".btn-filtro")
      .forEach((btn) => btn.classList.remove("activo"));
    btnPastas.classList.add("activo");
    const pastasFiltradas = todosLosProductos.filter(
      (producto) => producto.categoria === "pastas"
    );
    mostrarProductos(pastasFiltradas);
  });

  const btnSalsas = document.createElement("button");
  btnSalsas.textContent = "Salsas";
  btnSalsas.className = "btn-filtro";
  btnSalsas.addEventListener("click", () => {
    document
      .querySelectorAll(".btn-filtro")
      .forEach((btn) => btn.classList.remove("activo"));
    btnSalsas.classList.add("activo");
    const salsasFiltradas = todosLosProductos.filter(
      (producto) => producto.categoria === "salsas"
    );
    mostrarProductos(salsasFiltradas);
  });

  botonesContainer.appendChild(btnTodos);
  botonesContainer.appendChild(btnPastas);
  botonesContainer.appendChild(btnSalsas);
  filtrosContainer.appendChild(botonesContainer);

  contenedor.appendChild(filtrosContainer);

  mostrarProductos(todosLosProductos);
}

function mostrarProductosDestacados() {
  const productosDestacados = todosLosProductos.slice(0, 4);
  mostrarProductos(productosDestacados);
}

function mostrarProductos(productos) {
  const contenedor = document.getElementById("productos-container");

  const filtrosContainer = document.querySelector(".filtros-container");

  const productosExistentes = document.querySelector(".productos-grid");
  if (productosExistentes) {
    productosExistentes.remove();
  }

  const titulo = document.createElement("h2");
  titulo.textContent = "Nuestros Productos";
  if (!filtrosContainer) {
    contenedor.appendChild(titulo);
  }

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

    const descripcion = document.createElement("p");
    descripcion.className = "descripcion";
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${producto.precio.toFixed(2)}`;

    const boton = document.createElement("button");
    boton.textContent = "Agregar al carrito";
    boton.className = "btn-agregar";

    boton.addEventListener("click", () => agregarAlCarrito(producto));

    card.appendChild(imagen);
    card.appendChild(nombre);
    card.appendChild(descripcion);
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
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("carrito-contador");
  if (contador) {
    contador.textContent = carrito.obtenerCantidadTotal();
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
    const contadorCarrito = document.createElement("span");
    contadorCarrito.id = "carrito-contador";
    contadorCarrito.textContent = carrito.obtenerCantidadTotal();
    contadorCarrito.className = "carrito-contador";

    btnVerCarrito.appendChild(contadorCarrito);
    header.appendChild(btnVerCarrito);
  }
}

function generarHTMLCarrito() {
  return carrito.items
    .map(
      (item) => `
          <div class="carrito-item">
              <img src="${item.producto.imagen}" alt="${
        item.producto.nombre
      }" width="50">
              <div class="carrito-item-info">
                  <h4>${item.producto.nombre}</h4>
                  <p>$${item.producto.precio.toFixed(2)} x ${
        item.cantidad
      } = $${item.obtenerSubtotal().toFixed(2)}</p>
                  <div class="carrito-item-controles">
                      <button class="btn-cantidad" onclick="disminuirCantidad(${
                        item.producto.id
                      })">-</button>
                      <span>${item.cantidad}</span>
                      <button class="btn-cantidad" onclick="aumentarCantidad(${
                        item.producto.id
                      })">+</button>
                      <button class="btn-eliminar" onclick="eliminarDelCarrito(${
                        item.producto.id
                      })">Eliminar</button>
                  </div>
              </div>
          </div>
      `
    )
    .join("");
}

function mostrarCarrito() {
  if (carrito.items.length === 0) {
    Swal.fire({
      title: "Carrito vacío",
      text: "No hay productos en el carrito",
      icon: "info",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const productosHTML = generarHTMLCarrito();

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
                  <div class="carrito-acciones">
                      <button class="btn-vaciar" onclick="vaciarCarrito()">Vaciar Carrito</button>
                  </div>
              </div>
          `,
    confirmButtonText: "Proceder al Checkout",
    showCancelButton: true,
    cancelButtonText: "Seguir Comprando",
    width: 600,
    didOpen: () => {
      window.aumentarCantidad = (id) => {
        carrito.aumentarCantidad(id);
        actualizarContadorCarrito();
        mostrarCarrito();
      };

      window.disminuirCantidad = (id) => {
        carrito.disminuirCantidad(id);
        actualizarContadorCarrito();
        mostrarCarrito();
      };

      window.eliminarDelCarrito = (id) => {
        carrito.eliminarProducto(id);
        actualizarContadorCarrito();
        mostrarCarrito();
      };

      window.vaciarCarrito = () => {
        carrito.vaciarCarrito();
        actualizarContadorCarrito();
        Swal.close();
        Swal.fire({
          title: "Carrito vaciado",
          text: "Se han eliminado todos los productos del carrito",
          icon: "info",
          confirmButtonText: "Aceptar",
        });
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      mostrarFormularioCheckout();
    }
  });
}

function mostrarFormularioCheckout() {
  Swal.fire({
    title: "Datos de Envío",
    html: `
      <form id="checkoutForm" class="checkout-form">
        <div class="form-group">
          <label for="checkout-nombre">Nombre completo:</label>
          <input type="text" id="checkout-nombre" class="swal2-input" required>
        </div>
        <div class="form-group">
          <label for="checkout-email">Email:</label>
          <input type="email" id="checkout-email" class="swal2-input" required>
        </div>
        <div class="form-group">
          <label for="checkout-telefono">Teléfono:</label>
          <input type="tel" id="checkout-telefono" class="swal2-input" required>
        </div>
        <div class="form-group">
          <label for="checkout-direccion">Dirección:</label>
          <input type="text" id="checkout-direccion" class="swal2-input" required>
        </div>
        <div class="form-group">
          <label for="checkout-ciudad">Ciudad:</label>
          <input type="text" id="checkout-ciudad" class="swal2-input" required>
        </div>
        <div class="form-group">
          <label for="checkout-codigo-postal">Código Postal:</label>
          <input type="text" id="checkout-codigo-postal" class="swal2-input" required>
        </div>
      </form>
    `,
    confirmButtonText: "Continuar al Pago",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    width: 600,
    preConfirm: () => {
      const form = document.getElementById("checkoutForm");
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }

      return {
        nombre: document.getElementById("checkout-nombre").value,
        email: document.getElementById("checkout-email").value,
        telefono: document.getElementById("checkout-telefono").value,
        direccion: document.getElementById("checkout-direccion").value,
        ciudad: document.getElementById("checkout-ciudad").value,
        codigoPostal: document.getElementById("checkout-codigo-postal").value,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const datosEnvio = result.value;
      mostrarFormularioPago(datosEnvio);
    }
  });
}

function mostrarFormularioPago(datosEnvio) {
  Swal.fire({
    title: "Método de Pago",
    html: `
      <form id="pagoForm" class="pago-form">
        <div class="form-group">
          <label>Seleccione método de pago:</label>
          <div class="metodos-pago">
            <div class="metodo-pago">
              <input type="radio" id="tarjeta" name="metodo-pago" value="tarjeta" checked>
              <label for="tarjeta">Tarjeta de Crédito/Débito</label>
            </div>
            <div class="metodo-pago">
              <input type="radio" id="transferencia" name="metodo-pago" value="transferencia">
              <label for="transferencia">Transferencia Bancaria</label>
            </div>
            <div class="metodo-pago">
              <input type="radio" id="efectivo" name="metodo-pago" value="efectivo">
              <label for="efectivo">Efectivo en Entrega</label>
            </div>
          </div>
        </div>
        
        <div id="datos-tarjeta" class="datos-pago">
          <div class="form-group">
            <label for="numero-tarjeta">Número de Tarjeta:</label>
            <input type="text" id="numero-tarjeta" class="swal2-input" placeholder="XXXX XXXX XXXX XXXX">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="fecha-vencimiento">Fecha de Vencimiento:</label>
              <input type="text" id="fecha-vencimiento" class="swal2-input" placeholder="MM/AA">
            </div>
            <div class="form-group">
              <label for="cvv">CVV:</label>
              <input type="text" id="cvv" class="swal2-input" placeholder="123">
            </div>
          </div>
          <div class="form-group">
            <label for="titular">Titular de la Tarjeta:</label>
            <input type="text" id="titular" class="swal2-input">
          </div>
        </div>
      </form>
    `,
    confirmButtonText: "Finalizar Compra",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    width: 600,
    didOpen: () => {
      const radios = document.querySelectorAll('input[name="metodo-pago"]');
      const datosTarjeta = document.getElementById("datos-tarjeta");

      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.value === "tarjeta") {
            datosTarjeta.style.display = "block";
          } else {
            datosTarjeta.style.display = "none";
          }
        });
      });
    },
    preConfirm: () => {
      const metodoPago = document.querySelector(
        'input[name="metodo-pago"]:checked'
      ).value;

      if (metodoPago === "tarjeta") {
        const numeroTarjeta = document.getElementById("numero-tarjeta").value;
        const fechaVencimiento =
          document.getElementById("fecha-vencimiento").value;
        const cvv = document.getElementById("cvv").value;
        const titular = document.getElementById("titular").value;

        if (!numeroTarjeta || !fechaVencimiento || !cvv || !titular) {
          Swal.showValidationMessage(
            "Por favor complete todos los campos de la tarjeta"
          );
          return false;
        }
      }

      return {
        metodoPago,
        datosPago:
          metodoPago === "tarjeta"
            ? {
                numeroTarjeta: document.getElementById("numero-tarjeta").value,
                fechaVencimiento:
                  document.getElementById("fecha-vencimiento").value,
                cvv: document.getElementById("cvv").value,
                titular: document.getElementById("titular").value,
              }
            : {},
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const datosPago = result.value;
      finalizarCompra(datosEnvio, datosPago);
    }
  });
}

function finalizarCompra(datosEnvio, datosPago) {
  const numeroOrden = Math.floor(100000 + Math.random() * 900000);
  const fecha = new Date().toLocaleDateString();

  const itemsCompra = carrito.items
    .map((item) => {
      return `
      <tr>
        <td>${item.producto.nombre}</td>
        <td>${item.cantidad}</td>
        <td>$${item.producto.precio.toFixed(2)}</td>
        <td>$${item.obtenerSubtotal().toFixed(2)}</td>
      </tr>
    `;
    })
    .join("");

  const metodoPagoTexto = {
    tarjeta: "Tarjeta de Crédito/Débito",
    transferencia: "Transferencia Bancaria",
    efectivo: "Efectivo en Entrega",
  };

  Swal.fire({
    title: "¡Compra Realizada con Éxito!",
    html: `
      <div class="comprobante">
        <div class="comprobante-header">
          <h3>Comprobante de Compra</h3>
          <p><strong>Orden #:</strong> ${numeroOrden}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
        </div>
        
        <div class="comprobante-cliente">
          <h4>Datos del Cliente</h4>
          <p><strong>Nombre:</strong> ${datosEnvio.nombre}</p>
          <p><strong>Email:</strong> ${datosEnvio.email}</p>
          <p><strong>Teléfono:</strong> ${datosEnvio.telefono}</p>
          <p><strong>Dirección:</strong> ${datosEnvio.direccion}, ${
      datosEnvio.ciudad
    }, CP: ${datosEnvio.codigoPostal}</p>
        </div>
        
        <div class="comprobante-productos">
          <h4>Productos Adquiridos</h4>
          <table class="tabla-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsCompra}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>$${carrito.calcularTotal().toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="comprobante-pago">
          <h4>Método de Pago</h4>
          <p>${metodoPagoTexto[datosPago.metodoPago]}</p>
        </div>
        
        <div class="comprobante-footer">
          <p>¡Gracias por tu compra! Recibirás un email con los detalles de tu pedido.</p>
        </div>
      </div>
    `,
    icon: "success",
    confirmButtonText: "Finalizar",
    width: 800,
  }).then(() => {
    carrito.vaciarCarrito();
    actualizarContadorCarrito();
  });
}

document.addEventListener("DOMContentLoaded", inicializar);
