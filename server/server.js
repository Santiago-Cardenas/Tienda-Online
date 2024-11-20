const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;
let ordenId = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Intento de inicio de sesión con email: ${email}, password: ${password}`);

    fs.readFile('data/usuarios.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer usuarios');
        const usuarios = JSON.parse(data);
        const usuario = usuarios.find(u => u.email === email && u.password === password);

        if (usuario) {
            res.json({ id: usuario.id, rol: usuario.rol });
        } else {
            res.status(401).send('Credenciales inválidas');
        }
    });
});

app.get('/productos', (req, res) => {
    fs.readFile('data/productos.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer productos');
        res.json(JSON.parse(data));
    });
});

app.post('/productos', (req, res) => {
    const { nombre, descripcion, precio, cantidad } = req.body;
    const nuevoProducto = { id: Date.now(), nombre, descripcion, precio, cantidad };

    fs.readFile('data/productos.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer productos');
        
        const productos = JSON.parse(data);
        productos.push(nuevoProducto);

        fs.writeFile('data/productos.json', JSON.stringify(productos, null, 2), err => {
            if (err) return res.status(500).send('Error al guardar producto');
            res.status(201).send('Producto agregado');
        });
    });
});

app.get('/productos/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile('data/productos.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer productos');
        
        const productos = JSON.parse(data);
        const producto = productos.find(p => p.id == id);
        if (producto) {
            res.json(producto);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    });
});

app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, cantidad, cantidadComprada } = req.body;

    fs.readFile('data/productos.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer productos');
        
        const productos = JSON.parse(data);
        const index = productos.findIndex(p => p.id == id);

        if (index !== -1) {
            const producto = productos[index];

            if (cantidadComprada) {
                if (producto.cantidad >= cantidadComprada) {
                    producto.cantidad -= cantidadComprada;
                } else {
                    return res.status(400).send('No hay suficiente cantidad en inventario');
                }
            } else {
                producto.nombre = nombre;
                producto.descripcion = descripcion;
                producto.precio = precio;
                producto.cantidad = cantidad;
            }

            productos[index] = producto;

            fs.writeFile('data/productos.json', JSON.stringify(productos, null, 2), err => {
                if (err) return res.status(500).send('Error al actualizar producto');
                res.status(200).send('Producto actualizado');
            });
        } else {
            res.status(404).send('Producto no encontrado');
        }
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile('data/productos.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer productos');
        
        let productos = JSON.parse(data);
        productos = productos.filter(p => p.id != id);

        fs.writeFile('data/productos.json', JSON.stringify(productos, null, 2), err => {
            if (err) return res.status(500).send('Error al eliminar producto');
            res.status(200).send('Producto eliminado');
        });
    });
});

app.post('/compras', (req, res) => {
    const orden = req.body;

    if (!orden.productos || orden.productos.length === 0) {
        return res.status(400).send('La orden debe contener productos');
    }

    const nuevaOrden = {
        id: ordenId++,
        fecha: new Date().toLocaleDateString(),
        productos: orden.productos.map(producto => ({
            nombre: producto.nombre,
            cantidad: producto.cantidad,
            precio: producto.precio,
            subtotal: producto.cantidad * producto.precio
        })),
        total: orden.productos.reduce((total, p) => total + (p.cantidad * p.precio), 0)
    };

    fs.readFile('data/compras.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer compras');
        
        const compras = JSON.parse(data);
        compras.push(nuevaOrden);

        fs.writeFile('data/compras.json', JSON.stringify(compras, null, 2), err => {
            if (err) return res.status(500).send('Error al guardar la orden');
            res.status(201).send('Orden generada');
        });
    });
});

app.get('/compras', (req, res) => {
    fs.readFile('data/compras.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer compras');
        const compras = JSON.parse(data);
        res.json(compras);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});