<?php
use Illuminate\Database\Eloquent\Model;

class RegistroLog extends Model
{
    protected $table = 'logs';
    public $timestamps = false;
    protected $fillable = ['acao', 'detalhe', 'usuarioId', 'timestamp'];
}
