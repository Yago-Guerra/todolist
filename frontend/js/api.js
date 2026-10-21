export const API_URL = "/api";

export async function requisicao(rota, metodo = "GET", dados) {
    const token = sessionStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const opcoes = {
        method: metodo,
        headers
    };
    if (dados !== undefined) {
        opcoes.body = JSON.stringify(dados);
    }

    const resposta = await fetch(`${API_URL}${rota}`, opcoes);
    if (resposta.status === 204) {
        return;
    }
    const resultado = await resposta.json();
    if (!resposta.ok) {
        if (resposta.status === 401) {
            sessionStorage.removeItem("token");
        }
        throw new Error(resultado.detail || "Não foi possível realizar a operação.");
    }
    return resultado;
}
