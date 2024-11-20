document.addEventListener("DOMContentLoaded", () => {
    cargarProductos(); 
    document.getElementById('generarOrden').addEventListener('click', generarOrden);
    document.getElementById('verHistorial').addEventListener('click', mostrarHistorial);
    document.getElementById('limpiarCarrito').addEventListener('click', limpiarCarrito);
    document.getElementById('toggleCarrito').addEventListener('click', () => {
        document.getElementById('carrito').classList.toggle('open');
    });
    document.getElementById('toggleCarritoClose').addEventListener('click', () => {
        document.getElementById('carrito').classList.remove('open');
    });
    document.getElementById('cerrarHistorial').addEventListener('click', () => {
        document.getElementById('historial').style.display = 'none'; // Ocultar historial
    });
});

function cargarProductos() {
    fetch('http://localhost:5000/productos')
        .then(response => response.json())
        .then(data => {
            const productosDiv = document.getElementById('productosList');
            productosDiv.innerHTML = '';

            data.forEach(producto => {
                const productoElement = document.createElement('div');
                productoElement.classList.add('producto');
                productoElement.innerHTML = `
                    <p><strong>${producto.nombre}</strong></p>
                    <p>${producto.descripcion}</p>
                    <p>Precio: $${producto.precio}</p>
                    <p>Cantidad disponible: ${producto.cantidad}</p>
                    <input type="number" id="cantidad_${producto.id}" min="1" max="${producto.cantidad}" value="1">
                    <button onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.cantidad})">Agregar al carrito</button>
                `;
                productosDiv.appendChild(productoElement);
            });
        })
        .catch(error => {
            alert('Error al cargar productos: ' + error.message);
        });
}

function agregarAlCarrito(id, nombre, precio, cantidadDisponible) {
    const cantidad = parseInt(document.getElementById(`cantidad_${id}`).value);
    if (isNaN(cantidad) || cantidad < 1 || cantidad > cantidadDisponible) {
        alert("Por favor, ingresa una cantidad válida (menor o igual a la cantidad disponible).");
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const productoExistente = carrito.find(item => item.id === id);
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, cantidad });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
}

function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoDiv = document.getElementById('productosCarrito');
    carritoDiv.innerHTML = '';

    if (carrito.length === 0) {
        carritoDiv.innerHTML = "<p>No has agregado productos al carrito.</p>";
    } else {
        carrito.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('producto');
            itemElement.innerHTML = `
                <p><strong>${item.nombre}</strong></p>
                <p>Precio: $${item.precio}</p>
                <p>Cantidad: ${item.cantidad}</p>
            `;
            carritoDiv.appendChild(itemElement);
        });
    }
}

function limpiarCarrito() {
    localStorage.removeItem('carrito');
    cargarCarrito();
    alert("El carrito ha sido vaciado.");
}

function generarOrden() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    const total = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    const orden = {
        fecha: new Date().toLocaleDateString(),
        productos: carrito.map(item => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.precio * item.cantidad
        })),
        total: total
    };

    fetch('http://localhost:5000/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orden)
    })
    .then(response => {
        if (response.ok) {
            alert("Orden generada con éxito");
            localStorage.removeItem('carrito');
            cargarCarrito();
            cargarProductos();
        } else {
            throw new Error('Error al generar la orden');
        }
    })
    .catch(error => {
        alert('Error al guardar la orden: ' + error.message);
    });
    actualizarInventario(carrito);
}

function actualizarInventario(carrito) {
    carrito.forEach(item => {
        fetch(`http://localhost:5000/productos/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: item.nombre,
                descripcion: item.descripcion,
                precio: item.precio,
                cantidadComprada: item.cantidad
            })
        })
        .then(response => {
            if (response.ok) {
                console.log(`Producto ${item.nombre} actualizado correctamente`);
            } else {
                console.error(`Error al actualizar el producto ${item.nombre}`);
            }
        })
        .catch(error => {
            console.error('Error al actualizar el inventario: ', error);
        });
    });
}

function mostrarHistorial() {
    fetch('http://localhost:5000/compras')
        .then(response => response.json())
        .then(data => {
            const historialDiv = document.getElementById('listaHistorial');
            historialDiv.innerHTML = '';

            if (data.length === 0) {
                historialDiv.innerHTML = '<p>No hay órdenes realizadas.</p>';
            } else {
                data.forEach(orden => {
                    const ordenElement = document.createElement('div');
                    ordenElement.classList.add('orden');
                    ordenElement.innerHTML = `
                        <p><strong>ID de la Orden:</strong> ${orden.id}</p>
                        <p><strong>Fecha:</strong> ${orden.fecha}</p>
                        <p><strong>Productos:</strong></p>
                        <ul>
                            ${orden.productos
                                .map(
                                    producto =>
                                        `<li>${producto.nombre} - Cantidad: ${producto.cantidad} - Subtotal: $${producto.subtotal}</li>`
                                )
                                .join('')}
                        </ul>
                        <p><strong>Total:</strong> $${orden.total}</p>
                        <hr>
                    `;
                    historialDiv.appendChild(ordenElement);
                });
            }
            document.getElementById('historial').style.display = 'block';
        })
        .catch(error => {
            alert('Error al cargar el historial de órdenes: ' + error.message);
        });
}

function cerrarSesion() {
    window.location.href = 'index.html';
}