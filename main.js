document.addEventListener('DOMContentLoaded', function () {
    const productos = [
        { nombre: "Sorrentinos", precio: 3000 },
        { nombre: "Humita", precio: 1500 },
        { nombre: "Ravioles", precio: 2500 },
        { nombre: "Tallarines", precio: 2000 },
        { nombre: "Bologñesa", precio: 1800 },
        { nombre: "Scarparo", precio: 2200 },
        { nombre: "Lasaña", precio: 3500 },
        { nombre: "Canelones", precio: 3200 },
        { nombre: "Salsa Mix", precio: 1000 },
        { nombre: "Bechamel", precio: 1200 }
    ];

    function obtenerPrecio(nombreProducto) {
        const producto = productos.find(p => p.nombre === nombreProducto);
        return producto ? producto.precio : 0;
    }

    function actualizarResultado(carrito) {
        const carritoHTML = carrito.map(p => `<li>${p.nombre} - $${p.precio}</li>`).join('');
        document.getElementById("carrito").innerHTML = `<ul>${carritoHTML}</ul>`;
    }

    function calcularPrecioTotal(carrito) {
        return carrito.reduce((total, p) => total + p.precio, 0);
    }

    function aplicarCostoEnvio(precioTotal) {
        return precioTotal * 1.10;
    }

    function aplicarDescuento(precioTotal, usuario) {
        if (usuario && usuario.suscrito) {
            return precioTotal * 0.90;
        }
        return precioTotal;
    }

    function guardarCarrito(carrito) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    function guardarUsuario(usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    function cargarUsuario() {
        const usuarioGuardado = localStorage.getItem('usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    }

    function agregarAlCarrito() {
        const producto = prompt("Ingrese el nombre del producto:");
        const cantidad = parseInt(prompt("Ingrese la cantidad:"), 10);

        if (cantidad <= 0 || isNaN(cantidad)) {
            alert("La cantidad debe ser mayor que cero.");
            return;
        }

        const precio = obtenerPrecio(producto);
        const nuevoProducto = { nombre: producto, precio: precio * cantidad };

        let carrito = cargarCarrito();
        carrito.push(nuevoProducto);
        guardarCarrito(carrito);
        actualizarResultado(carrito);
        alert("Producto agregado al carrito.");
    }

    function finalizarCompra() {
        let carrito = cargarCarrito();
        let usuario = cargarUsuario();

        if (carrito.length === 0) {
            alert("El carrito está vacío. Agregue productos antes de finalizar la compra.");
            return;
        }

        const precioTotal = calcularPrecioTotal(carrito);
        const precioConDescuento = aplicarDescuento(precioTotal, usuario);
        const precioConEnvio = aplicarCostoEnvio(precioConDescuento);

        const resultadoHTML = document.getElementById("resultado");
        resultadoHTML.innerHTML = `<p>Gracias por su compra!</p><p>Costo total con envío y descuento: $${precioConEnvio.toFixed(2)}</p>`;

        localStorage.removeItem('carrito');
        actualizarResultado([]);
    }

    function crearUsuario() {
        const nombreUsuario = prompt("Ingrese su nombre:");
        const subscribir = confirm("¿Desea suscribirse para obtener un descuento?");

        const nuevoUsuario = {
            nombre: nombreUsuario,
            suscrito: subscribir
        };

        guardarUsuario(nuevoUsuario);
        alert("Usuario creado exitosamente.");
    }

    document.getElementById("agregarBtn").addEventListener("click", agregarAlCarrito);
    document.getElementById("finalizarBtn").addEventListener("click", finalizarCompra);
    document.getElementById("crearUsuarioBtn").addEventListener("click", crearUsuario);

    const carritoInicial = cargarCarrito();
    actualizarResultado(carritoInicial);
});
