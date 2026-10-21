<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$caminho = __DIR__ . '/logs.db';
if (!file_exists($caminho)) {
    touch($caminho);
}

$banco = new Capsule();
$banco->addConnection(['driver' => 'sqlite', 'database' => $caminho]);
$banco->setAsGlobal();
$banco->bootEloquent();

if (!Capsule::schema()->hasTable('logs')) {
    Capsule::schema()->create('logs', function ($tabela) {
        $tabela->increments('id');
        $tabela->string('acao');
        $tabela->text('detalhe');
        $tabela->integer('usuarioId')->nullable();
        $tabela->timestamp('timestamp');
    });
}
