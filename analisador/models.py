from sqlalchemy import Boolean, Column, Integer, String
from database import base

class Tarefa(base):
    __tablename__ = 'Tarefa'
    id = Column(Integer, primary_key=True)
    titulo = Column(String)
    concluida = Column(Boolean)
    usuarioId = Column(Integer)
