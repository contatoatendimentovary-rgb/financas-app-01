const express = require('express');
const path = require('path');

const app = express();

// 👉 Servir arquivos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// 👉 Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 Start
app.listen(3000, () => {
    console.log("🔥 Rodando em http://localhost:3000");
});
