from pydantic import BaseModel

class Resposta_Estatisticas(BaseModel):
    usuarioId: int
    total: int
    concluidas: int
    pendentes: int
