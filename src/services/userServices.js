import api from "./authServices";

// datos actuales del usuario logueado (el back lo identifica por el token)
// el signal permite cancelar la petición si el componente se destruye antes de que responda
export const obtenerUsuarioApi = async (signal) => {
    const resultado = await api.get("/users", {
        signal: signal
    });
    return resultado.data;
}

// el usuario logueado edita su nombre, username y/o email (al menos uno)
export const editarUsuarioApi = async (datos) => {
    const resultado = await api.patch("/users", datos);
    return resultado.data;
}

// el usuario logueado elimina su cuenta (el back no lo permite si tiene reservas)
export const eliminarCuentaApi = async () => {
    await api.delete("/users");
}

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

// el admin elimina un cliente (el back no lo permite si tiene reservas)
export const eliminarClienteApi = async (idCliente) => {
    const resultado = await api.delete(`/users/clientes/${idCliente}`);
    return resultado.data;
}
