const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    const ordersFilePath = path.join(__dirname, '../data', 'orders.json');

    fs.readFile(ordersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer las órdenes');
        }
        res.json(JSON.parse(data));
    });
});

router.post('/add', (req, res) => {
    const { userId, productos, total } = req.body;
    const ordersFilePath = path.join(__dirname, '../data', 'orders.json');

    fs.readFile(ordersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer las órdenes');
        }

        const orders = JSON.parse(data);
        const newOrder = { 
            id: orders.length + 1, 
            userId, 
            productos, 
            total, 
            fecha: new Date().toISOString() 
        };
        orders.push(newOrder);

        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al guardar la orden');
            }
            res.json({ success: true, message: 'Orden agregada correctamente' });
        });
    });
});

module.exports = router;