const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { Usuario, Tarefa } = require('./models');
const { usuario_valido, tarefa_valida, usuario_publico } = require('./schemas');
const { bcrypt, token_criar, obter_usuario } = require('./security');
const { registrar_log } = require('./logs');

if (!process.env.SERVICE_KEY || process.env.SERVICE_KEY.length < 32) {
    throw new Error('Configure SERVICE_KEY com pelo menos 32 caracteres no .env da raiz.');
}

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.post('/api/registrar', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!usuario_valido(req.body)) {
        return res.status(400).json({ detail: 'Informe nome (3 a 100 caracteres), email válido e senha (mínimo 6 caracteres, máximo 72 bytes).' });
    }
    try {
        const usuario = await Usuario.create({ data: {
            nome: nome.trim(), email: email.trim().toLowerCase(), senha: await bcrypt.hash(senha, 10)
        } });
        res.status(201).json(usuario_publico(usuario));
    } catch (erro) {
        if (erro.code === 'P2002') {
            return res.status(409).json({ detail: 'Email já cadastrado.' });
        }
        throw erro;
    }
});

app.post('/api/logar', async (req, res) => {
    const { email, senha } = req.body;
    let usuario = null;
    if (typeof email === 'string') {
        usuario = await Usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
    }
    if (!usuario || typeof senha !== 'string' || Buffer.byteLength(senha) > 72 || !await bcrypt.compare(senha, usuario.senha)) {
        await registrar_log('ACESSO_INDEVIDO', 'Tentativa de login com credenciais inválidas');
        return res.status(401).json({ detail: 'Email ou senha inválidos.' });
    }
    const token = token_criar();
    await Usuario.update({ where: { id: usuario.id }, data: { token: token.hash } });
    res.json({ token: token.token, usuario: usuario_publico(usuario) });
});

app.get('/api/perfil', obter_usuario, (req, res) => {
    res.json(usuario_publico(req.usuario));
});
app.post('/api/deslogar', obter_usuario, async (req, res) => {
    await Usuario.update({ where: { id: req.usuario.id }, data: { token: null } });
    res.json({ message: 'Logout realizado.' });
});

app.get('/api/tarefas', obter_usuario, async (req, res) => {
    const tarefas = await Tarefa.findMany({
        where: { usuarioId: req.usuario.id },
        orderBy: { id: 'desc' }
    });
    res.json(tarefas);
});

app.post('/api/tarefas', obter_usuario, async (req, res) => {
    const { titulo, descricao = '' } = req.body;
    if (!tarefa_valida(req.body)) {
        return res.status(400).json({ detail: 'Informe título (até 200 caracteres) e descrição (até 2000).' });
    }
    const tarefa = await Tarefa.create({ data: { titulo: titulo.trim(), descricao, usuarioId: req.usuario.id } });
    await registrar_log('CRIACAO', `Tarefa ${tarefa.id} criada`, req.usuario.id);
    res.status(201).json(tarefa);
});

app.use('/api/tarefas/:id', obter_usuario, async (req, res, next) => {
    const id = Number(req.params.id);
    let tarefa = null;
    if (Number.isSafeInteger(id) && id > 0) {
        tarefa = await Tarefa.findFirst({ where: { id, usuarioId: req.usuario.id } });
    }
    if (!tarefa) {
        await registrar_log('ACESSO_INDEVIDO', 'Tentativa de acessar tarefa inexistente ou de outro usuário', req.usuario.id);
        return res.status(404).json({ detail: 'Tarefa não encontrada.' });
    }
    req.tarefa = tarefa;
    next();
});

app.put('/api/tarefas/:id', async (req, res) => {
    const { concluida } = req.body;
    if (typeof concluida !== 'boolean') {
        return res.status(400).json({ detail: 'concluida deve ser true ou false.' });
    }
    const tarefa = await Tarefa.update({ where: { id: req.tarefa.id, usuarioId: req.usuario.id }, data: { concluida } });
    await registrar_log(concluida ? 'CONCLUSAO' : 'REABERTURA', `Tarefa ${tarefa.id} alterada`, req.usuario.id);
    res.json(tarefa);
});

app.delete('/api/tarefas/:id', async (req, res) => {
    await Tarefa.delete({ where: { id: req.tarefa.id, usuarioId: req.usuario.id } });
    await registrar_log('EXCLUSAO', `Tarefa ${req.tarefa.id} excluída`, req.usuario.id);
    res.status(204).end();
});

app.get('/api/stats', obter_usuario, async (req, res) => {
    try {
        const resposta = await fetch('http://127.0.0.1:8001/api/stats', {
            headers: { Authorization: req.get('Authorization') }, signal: AbortSignal.timeout(5000)
        });
        res.status(resposta.status).json(await resposta.json());
    } catch (erro) {
        await registrar_log('ERRO', 'Analisador indisponível', req.usuario.id);
        res.status(503).json({ detail: 'Serviço de estatísticas indisponível.' });
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({ detail: 'Rota não encontrada.' });
});
app.use(async (erro, req, res, next) => {
    console.error(erro.message);
    try {
        await registrar_log('ERRO', `Falha em ${req.method} ${req.path}`, req.usuario?.id);
    } catch (falha) {
        console.error('Não foi possível persistir o log:', falha.message);
    }
    if (erro.status === 400) {
        return res.status(400).json({ detail: 'JSON inválido.' });
    }
    res.status(500).json({ detail: 'Erro interno no servidor.' });
});

if (require.main === module) {
    app.listen(3001, '127.0.0.1', () => console.log('Abra http://localhost:3001'));
}
module.exports = app;
