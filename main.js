import bechamelImage from "./imagen/bechamel.jpeg";
import bolognesaImage from "./imagen/bolognesa.jpeg";
import canelonesImage from "./imagen/canelones.jpeg";
import backgroundImage from "./imagen/fondo de pasta.jpeg";
import humitaImage from "./imagen/humita.jpeg";
import lasañaImage from "./imagen/lasaña.jpeg";
import raviolesImage from "./imagen/ravioles.jpeg";
import salsaMixImage from "./imagen/salsa_mix.jpeg";
import scarparoImage from "./imagen/scarparo.jpeg";
import sorrentinoImage from "./imagen/sorrentinos.jpeg";
import tallarinesImage from "./imagen/tallarines.jpeg";
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
    const productos = [
        { nombre: "Sorrentinos", precio: 3000, imagen: sorrentinoImage },
        { nombre: "Humita", precio: 1500, imagen: humitaImage },
        { nombre: "Ravioles", precio: 2500, imagen: raviolesImage },
        { nombre: "Tallarines", precio: 2000, imagen: tallarinesImage },
        { nombre: "Bologñesa", precio: 1800, imagen: bolognesaImage },
        { nombre: "Scarparo", precio: 2200, imagen: scarparoImage },
        { nombre: "Lasaña", precio: 3500, imagen: lasañaImage },
        { nombre: "Canelones", precio: 3200, imagen: canelonesImage },
        { nombre: "Salsa Mix", precio: 1000, imagen: salsaMixImage },
        { nombre: "Bechamel", precio: 1200, imagen: bechamelImage }
    ];

    document.body.style.backgroundImage = `url(${backgroundImage})`;

    productos.forEach(producto => {
        const imgElement = document.createElement('img');
        imgElement.src = producto.imagen;
        imgElement.alt = producto.nombre;
        imgElement.className = 'img-fluid mt-3';
        document.getElementById('productos').appendChild(imgElement);
    });

    const obtenerPrecio = nombreProducto => {
        const producto = productos.find(p => p.nombre === nombreProducto);
        return producto ? producto.precio : 0;
    };

    const actualizarResultado = carrito => {
        const carritoHTML = carrito.map(p => `<li>${p.nombre} - $${p.precio}</li>`).join('');
        document.getElementById("carrito").innerHTML = `<ul>${carritoHTML}</ul>`;
        const total = calcularPrecioTotal(carrito);
        document.getElementById("resultado").innerHTML = `<p>Total: $${total}</p>`;
    };

    const calcularPrecioTotal = carrito => carrito.reduce((total, p) => total + p.precio, 0);

    const aplicarCostoEnvio = precioTotal => precioTotal * 1.10;

    const aplicarDescuento = (precioTotal, usuario) => usuario && usuario.suscrito ? precioTotal * 0.90 : precioTotal;

    const guardarCarrito = carrito => localStorage.setItem('carrito', JSON.stringify(carrito));

    const cargarCarrito = () => JSON.parse(localStorage.getItem('carrito') || '[]');

    const guardarUsuario = usuario => localStorage.setItem('usuario', JSON.stringify(usuario));

    const cargarUsuario = () => JSON.parse(localStorage.getItem('usuario') || 'null');

    const agregarAlCarrito = async () => {
        const { value: producto } = await Swal.fire({
            title: 'Ingrese el nombre del producto:',
            input: 'text',
            inputPlaceholder: 'Nombre del producto',
            showCancelButton: true
        });

        if (!producto) {
            return;
        }

        const { value: cantidad } = await Swal.fire({
            title: 'Ingrese la cantidad:',
            input: 'number',
            inputPlaceholder: 'Cantidad',
            showCancelButton: true
        });

        if (cantidad <= 0 || isNaN(cantidad)) {
            Swal.fire('La cantidad debe ser mayor que cero.');
            return;
        }

        const precio = obtenerPrecio(producto);

        if (precio === 0) {
            Swal.fire('Producto no encontrado. Por favor, ingrese un producto válido.');
            return;
        }

        const nuevoProducto = { nombre: producto, precio: precio * cantidad };

        let carrito = cargarCarrito();
        carrito.push(nuevoProducto);
        guardarCarrito(carrito);
        actualizarResultado(carrito);
        Swal.fire('Producto agregado al carrito.');
    };

    const finalizarCompra = () => {
        let carrito = cargarCarrito();
        let usuario = cargarUsuario();

        if (carrito.length === 0) {
            Swal.fire('El carrito está vacío. Agregue productos antes de finalizar la compra.');
            return;
        }

        const precioTotal = calcularPrecioTotal(carrito);
        const precioConDescuento = aplicarDescuento(precioTotal, usuario);
        const precioConEnvio = aplicarCostoEnvio(precioConDescuento);

        document.getElementById("resultado").innerHTML = `<p>Gracias por su compra!</p><p>Costo total con envío y descuento: $${precioConEnvio.toFixed(2)}</p>`;

        localStorage.removeItem('carrito');
        actualizarResultado([]);
    };

    const crearUsuario = async () => {
        const { value: nombreUsuario } = await Swal.fire({
            title: 'Ingrese su nombre:',
            input: 'text',
            inputPlaceholder: 'Nombre'
        });

        if (!nombreUsuario) {
            return;
        }

        const { isConfirmed: subscribir } = await Swal.fire({
            title: '¿Desea suscribirse para obtener un descuento?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        const nuevoUsuario = {
            nombre: nombreUsuario,
            suscrito: subscribir
        };

        try {
            const response = await fetch('https://api.tienda-de-pastas.com/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            guardarUsuario(data);
            Swal.fire('Usuario creado exitosamente.');
        } catch (error) {
            Swal.fire('Error al crear el usuario. Intente nuevamente.');
        }
    };

    const mostrarProductos = () => {
        const productosContainer = document.getElementById('productos');
        if (!productosContainer) {
            console.error('El contenedor de productos no existe');
            return;
        }

        const productosHTML = productos.map(p => `<li>${p.nombre} - $${p.precio}</li>`).join('');
        productosContainer.innerHTML = `<ul>${productosHTML}</ul>`;
    };

    document.getElementById("agregarBtn").addEventListener("click", agregarAlCarrito);
    document.getElementById("finalizarBtn").addEventListener("click", finalizarCompra);
    document.getElementById("crearUsuarioBtn").addEventListener("click", crearUsuario);

    actualizarResultado(cargarCarrito());
    mostrarProductos();
});

