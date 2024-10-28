const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
    secret: 'secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const users = [{ username: 'user', password: 'pass' }];

app.get('/', (req, res) => {
    res.send('<h1>Bem-vindo ao sistema de autenticação!</h1><a href="/login">Login</a> | <a href="/protected">Página Protegida</a>');
});

app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Usuário" required>
            <input type="password" name="password" placeholder="Senha" required>
            <button type="submit">Login</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        req.session.userId = user.username; 
        res.redirect('/protected');
    } else {
        res.send('Usuário ou senha incorretos. <a href="/login">Tente novamente</a>');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/protected');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});


const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};


app.get('/protected', isAuthenticated, (req, res) => {
    res.send(`<h1>Página Protegida</h1><p>Bem-vindo, ${req.session.userId}!</p><a href="/logout">Logout</a>`);
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});