from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from database import get_banco
from models import Tarefa
from security import obter_usuario
from schemas import Resposta_Estatisticas

app = FastAPI(title='Analisador de tarefas')
@app.get('/api/stats', response_model=Resposta_Estatisticas)
def estatisticas(
    usuario: dict = Depends(obter_usuario),
    banco: Session = Depends(get_banco)
):
    tarefas = banco.query(Tarefa).filter(Tarefa.usuarioId == usuario['id'])
    total = tarefas.count()
    concluidas = tarefas.filter(Tarefa.concluida.is_(True)).count()
    return {
        'usuarioId': usuario['id'],
        'total': total,
        'concluidas': concluidas,
        'pendentes': total - concluidas
    }
