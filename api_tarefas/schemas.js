function usuario_valido({ nome, email, senha }) {
    if (typeof nome !== 'string' || nome.trim().length < 3 || nome.length > 100) {
        return false;
    }
    if (typeof email !== 'string' || email.length > 254) {
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return false;
    }
    if (typeof senha !== 'string' || senha.length < 6 || Buffer.byteLength(senha) > 72) {
        return false;
    }
    return true;
}

function tarefa_valida({ titulo, descricao = '' }) {
    if (typeof titulo !== 'string' || !titulo.trim() || titulo.length > 200) {
        return false;
    }
    if (typeof descricao !== 'string' || descricao.length > 2000) {
        return false;
    }
    return true;
}

function usuario_publico(usuario) {
    return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

module.exports = { usuario_valido, tarefa_valida, usuario_publico };
