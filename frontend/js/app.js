import { requisicao } from "./api.js";
import { getTodos, createTodo, toggleTodo, deleteTodo, getStats } from "./todoService.js";

const elemento = id => document.getElementById(id);

function mostrarTela() {
    const logado = Boolean(sessionStorage.getItem("token"));
    elemento("auth").hidden = logado;
    elemento("tasks").hidden = !logado;
    if (!logado) elemento("todoList").replaceChildren();
}

async function executar(acao) {
    elemento("message").textContent = "";
    try {
        await acao();
    } catch (erro) {
        elemento("message").textContent = erro.message;
    }
    mostrarTela();
}

async function refresh() {
    const tarefas = await getTodos();
    elemento("todoList").replaceChildren();
    tarefas.forEach(tarefa => {
        const li = document.createElement("li");
        if (tarefa.concluida) li.classList.add("completed");
        const texto = document.createElement("span");
        texto.textContent = tarefa.titulo;
        if (tarefa.descricao) texto.textContent += ` — ${tarefa.descricao}`;
        const acoes = document.createElement("div");
        acoes.className = "actions";
        const concluir = document.createElement("button");
        concluir.textContent = tarefa.concluida ? "Reabrir" : "Concluir";
        concluir.className = "btn-complete";
        concluir.onclick = () => executar(async () => {
            await toggleTodo(tarefa.id, !tarefa.concluida);
            await refresh();
        });
        const excluir = document.createElement("button");
        excluir.textContent = "Excluir";
        excluir.className = "btn-delete";
        excluir.onclick = () => executar(async () => {
            await deleteTodo(tarefa.id);
            await refresh();
        });
        acoes.append(concluir, excluir);
        li.append(texto, acoes);
        elemento("todoList").append(li);
    });
    const stats = await getStats();
    elemento("total").textContent = stats.total;
    elemento("completed").textContent = stats.concluidas;
    elemento("pending").textContent = stats.pendentes;
}

elemento("registerForm").onsubmit = evento => {
    evento.preventDefault();
    executar(async () => {
        await requisicao("/registrar", "POST", {
            nome: elemento("name").value,
            email: elemento("email").value,
            senha: elemento("password").value
        });
        elemento("registerForm").reset();
        elemento("message").textContent = "Cadastro realizado. Faça login.";
    });
};

elemento("loginForm").onsubmit = evento => {
    evento.preventDefault();
    executar(async () => {
        const dados = await requisicao("/logar", "POST", {
            email: elemento("loginEmail").value,
            senha: elemento("loginPassword").value
        });
        sessionStorage.setItem("token", dados.token);
        elemento("userName").textContent = dados.usuario.nome;
        elemento("loginForm").reset();
        await refresh();
    });
};

elemento("todoForm").onsubmit = evento => {
    evento.preventDefault();
    executar(async () => {
        await createTodo({ titulo: elemento("title").value, descricao: elemento("description").value });
        elemento("todoForm").reset();
        await refresh();
    });
};

elemento("logout").onclick = () => executar(async () => {
    await requisicao("/deslogar", "POST");
    sessionStorage.removeItem("token");
});

mostrarTela();
if (sessionStorage.getItem("token")) executar(async () => {
    const usuario = await requisicao("/perfil");
    elemento("userName").textContent = usuario.nome;
    await refresh();
});
