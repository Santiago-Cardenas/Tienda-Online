document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }
        return response.json();
    })
    .then(data => {
        if (data.rol === 'admin') {
            window.location.href = 'admin.html';
        } else if (data.rol === 'cliente') {
            window.location.href = 'productos.html';
        }
    })
    .catch(error => {
        alert(error.message);
    });
});