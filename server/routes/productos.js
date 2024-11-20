const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    const productsFilePath = path.join(__dirname, '../data', 'products.json');

    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer los productos');
        }
        res.json(JSON.parse(data));
    });
});

router.post('/add', (req, res) => {
    const { nombre, descripcion, precio, cantidad } = req.body;
    const productsFilePath = path.join(__dirname, '../data', 'products.json');

    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer los productos');
        }

        const products = JSON.parse(data);
        const newProduct = { id: products.length + 1, nombre, descripcion, precio, cantidad };
        products.push(newProduct);

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al guardar el producto');
            }
            res.json({ success: true, message: 'Producto agregado correctamente' });
        });
    });
});

module.exports = router;