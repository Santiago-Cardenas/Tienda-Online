document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();

    document.getElementById('agregarProductoForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const producto = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            precio: document.getElementById('precio').value,
            cantidad: document.getElementById('cantidad').value
        };

        fetch('http://localhost:5000/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        })
        .then(response => {
            if (response.ok) {
                alert('Producto agregado exitosamente');
                cargarProductos();
                document.getElementById('agregarProductoForm').reset();
            } else {
                return response.text().then(text => { 
                    throw new Error(text);
                });
            }
        })
        .catch(error => {
            alert('Error al agregar el producto: ' + error.message);
        });
    });

    document.getElementById('actualizarProductoForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const productoId = document.getElementById('nombreUpdate').dataset.productoId;
        const producto = {
            nombre: document.getElementById('nombreUpdate').value,
            descripcion: document.getElementById('descripcionUpdate').value,
            precio: document.getElementById('precioUpdate').value,
            cantidad: document.getElementById('cantidadUpdate').value
        };

        fetch(`http://localhost:5000/productos/${productoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        })
        .then(response => {
            if (response.ok) {
                alert('Producto actualizado exitosamente');
                cargarProductos();
                document.getElementById('formularioActualizar').style.display = 'none';
                document.getElementById('agregarProductoForm').style.display = 'block';
                document.getElementById('actualizarProductoForm').reset();
            } else {
                return response.text().then(text => { 
                    throw new Error(text);
                });
            }
        })
        .catch(error => {
            alert('Error al actualizar el producto: ' + error.message);
        });
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
                    <p>Cantidad: ${producto.cantidad}</p>
                    <button onclick="editarProducto(${producto.id})">Editar</button>
                    <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
                `;
                productosDiv.appendChild(productoElement);
            });
        })
        .catch(error => {
            alert('Error al cargar productos: ' + error.message);
        });
}

function editarProducto(productoId) {
    fetch(`http://localhost:5000/productos/${productoId}`)
        .then(response => response.json())
        .then(producto => {
            document.getElementById('nombreUpdate').value = producto.nombre;
            document.getElementById('descripcionUpdate').value = producto.descripcion;
            document.getElementById('precioUpdate').value = producto.precio;
            document.getElementById('cantidadUpdate').value = producto.cantidad;
            document.getElementById('nombreUpdate').dataset.productoId = productoId;
            document.getElementById('agregarProductoForm').style.display = 'none';
            document.getElementById('formularioActualizar').style.display = 'block';
        })
        .catch(error => {
            alert('Error al cargar los datos del producto para editar: ' + error.message);
        });
}

function eliminarProducto(productoId) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        fetch(`http://localhost:5000/productos/${productoId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('Producto eliminado exitosamente');
                cargarProductos();
            } else {
                return response.text().then(text => { 
                    throw new Error(text);
                });
            }
        })
        .catch(error => {
            alert('Error al eliminar el producto: ' + error.message);
        });
    }
}

function cerrarSesion() {
    window.location.href = 'index.html';
}
