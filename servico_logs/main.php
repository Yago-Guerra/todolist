<?php
header('Content-Type: application/json; charset=utf-8');

function responder($status, $dados)
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

$config = @parse_ini_file(__DIR__ . '/../.env', false, INI_SCANNER_RAW) ?: [];
$chave = $config['SERVICE_KEY'] ?? '';
if (strlen($chave) < 32) {
    responder(500, ['detail' => 'Configure SERVICE_KEY no .env.']);
}
if (!hash_equals($chave, $_SERVER['HTTP_X_SERVICE_KEY'] ?? '')) {
    responder(401, ['detail' => 'Serviço não autorizado.']);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) !== '/api/logs') {
    responder(404, ['detail' => 'Rota não encontrada.']);
}

try {
    $dados = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($dados) || !is_string($dados['acao'] ?? null) || !is_string($dados['detalhe'] ?? null) ||
        strlen($dados['acao']) > 100 || strlen($dados['detalhe']) > 2000 ||
        (isset($dados['usuarioId']) && (!is_int($dados['usuarioId']) || $dados['usuarioId'] < 1))) {
        responder(400, ['detail' => 'Dados do log inválidos.']);
    }
    require __DIR__ . '/database.php';
    require __DIR__ . '/models.php';
    $log = RegistroLog::create([
        'acao' => $dados['acao'],
        'detalhe' => $dados['detalhe'],
        'usuarioId' => $dados['usuarioId'] ?? null,
        'timestamp' => gmdate('Y-m-d H:i:s')
    ]);
    responder(201, ['id' => $log->id]);
} catch (JsonException $erro) {
    responder(400, ['detail' => 'JSON inválido.']);
} catch (Throwable $erro) {
    error_log($erro->getMessage());
    responder(500, ['detail' => 'Erro ao salvar log.']);
}
