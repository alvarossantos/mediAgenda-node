require('dotenv').config();
var mysql = require('mysql2');

var conexao = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER ||'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'labdbprog2'
});

conexao.connect(function(erro){
    if(erro){
        console.log('Erro ao conectar no banco de dados:');
        console.log(erro);
        return;
    }
    console.log('Conectado ao MySQL com sucesso!');
});
module.exports = conexao;