import { requisicao } from "./api.js";

export const getTodos = () => requisicao("/tarefas");
export const createTodo = dados => requisicao("/tarefas", "POST", dados);
export const toggleTodo = (id, concluida) => requisicao(`/tarefas/${id}`, "PUT", { concluida });
export const deleteTodo = id => requisicao(`/tarefas/${id}`, "DELETE");
export const getStats = () => requisicao("/stats");
