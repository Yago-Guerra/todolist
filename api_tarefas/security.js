const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const { Usuario } = require('./models');
const { registrar_log } = require('./logs');

function token_criar() {
    const token = crypto.randomBytes(32).toString('hex');
    return { token, hash: token_hash(token) };
}

function token_hash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function obter_usuario(req, res, next) {
    const cabecalho = req.get('Authorization') || '';
    const partes = cabecalho.split(' ');
    let usuario = null;

    if (partes.length === 2 && partes[0] === 'Bearer' && /^[a-f0-9]{64}$/.test(partes[1])) {
        const token = token_hash(partes[1]);
        usuario = await Usuario.findUnique({ where: { token } });
    }
    if (!usuario) {
        await registrar_log('ACESSO_INDEVIDO', 'Token ausente ou inválido');
        return res.status(401).json({ detail: 'Faça login para continuar.' });
    }
    req.usuario = usuario;
    next();
}

module.exports = { bcrypt, token_criar, obter_usuario };
