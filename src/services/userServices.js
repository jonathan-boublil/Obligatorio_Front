import api from "./authServices";

export const cambiarPlanApi = async (plan) => {
    const resultado = await api.patch("/users/plan", { plan });
    return resultado.data.user;
}

export const listarReservasApi = async () => {
    const resultado = await api.get("/reservas");
    return resultado.data;
}
