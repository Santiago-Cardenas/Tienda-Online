const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const usersFilePath = path.join(__dirname, '../data', 'users.json');

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer los usuarios');
        }

        const users = JSON.parse(data);
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }

        if (user.password === password) {
            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                role: user.rol,
            });
        } else {
            res.json({ success: false, message: 'Contraseña incorrecta' });
        }
    });
});


module.exports = router;