import api from "./authServices";

export const cambiarPlanApi = async (plan) => {
    const resultado = await api.patch("/users/plan", { plan });
    return resultado.data.user;
}

export const listarReservasApi = async () => {
    const resultado = await api.get("/reservas");
    return resultado.data;
}

// todos los clientes, solo para admin
// el signal permite cancelar la petición si el componente se destruye antes de que responda
export const listarClientesApi = async (signal) => {
    const resultado = await api.get("/users/clientes", {
        signal: signal
    });
    return resultado.data;
}

// el admin edita nombre, username y email de un cliente (el plan no se puede editar)
export const editarClienteApi = async (idCliente, datos) => {
    const resultado = await api.patch(`/users/clientes/${idCliente}`, datos);
    return resultado.data.cliente;
}

// el admin elimina un cliente (el back también borra sus reservas)
export const eliminarClienteApi = async (idCliente) => {
    const resultado = await api.delete(`/users/clientes/${idCliente}`);
    return resultado.data;
}
