import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer(auto_error=False)

async def obter_usuario(
    credenciais: HTTPAuthorizationCredentials = Depends(security)
):
    if not credenciais:
        raise HTTPException(status_code=401, detail='Token obrigatório.')
    try:
        async with httpx.AsyncClient(timeout=5) as cliente:
            resposta = await cliente.get(
                'http://127.0.0.1:3001/api/perfil',
                headers={'Authorization': f'Bearer {credenciais.credentials}'}
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail='API de autenticação indisponível.')
    if resposta.status_code == 401:
        raise HTTPException(status_code=401, detail='Token inválido.')
    if resposta.status_code != 200:
        raise HTTPException(status_code=503, detail='Não foi possível validar o usuário.')
    return resposta.json()
