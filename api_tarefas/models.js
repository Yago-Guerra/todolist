const banco = require('./database');

const Usuario = banco.usuario;
const Tarefa = banco.tarefa;

module.exports = { Usuario, Tarefa };
