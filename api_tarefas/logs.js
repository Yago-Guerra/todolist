async function registrar_log(acao, detalhe, usuarioId = null) {
    const resposta = await fetch('http://127.0.0.1:8000/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Service-Key': process.env.SERVICE_KEY },
        body: JSON.stringify({ acao, detalhe, usuarioId }),
        signal: AbortSignal.timeout(3000)
    });
    if (!resposta.ok) throw new Error('Não foi possível registrar o log.');
}

module.exports = { registrar_log };
