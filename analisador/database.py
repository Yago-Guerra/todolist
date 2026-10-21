from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

caminho = Path(__file__).resolve().parent.parent / 'api_tarefas' / 'tarefas.db'
engine_do_banco = create_engine(
    f'sqlite:///file:{caminho.as_posix()}?mode=ro&uri=true',
    connect_args={'check_same_thread': False}
)
sessao = sessionmaker(bind=engine_do_banco)
base = declarative_base()

def get_banco():
    banco = sessao()
    try:
        yield banco
    finally:
        banco.close()
