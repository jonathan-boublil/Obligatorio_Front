import api from "./authServices";

// servicios que se pueden reservar (se cargan desde el back)
export const listarCategoriasApi = async () => {
    const resultado = await api.get("/categorias");
    return resultado.data;
}

// crea una categoría nueva, solo para admin; el back le asigna el id
export const crearCategoriaApi = async (categoria) => {
    const resultado = await api.post("/categorias", categoria);
    return resultado.data.categoria;
}

export const crearReservaApi = async (reserva) => {
    const resultado = await api.post("/reservas", reserva);
    return resultado.data;
}

// cambia fecha, hora y nombre de la mascota de una reserva del usuario logueado (fecha en DD-MM-AAAA)
export const reprogramarReservaApi = async (idReserva, nuevaFecha, nuevaHora, nombreMascota) => {
    const resultado = await api.patch(`/reservas/${idReserva}`, { nuevaFecha, nuevaHora, nombreMascota });
    return resultado.data.reserva;
}

export const eliminarReservaApi = async (idReserva) => {
    const resultado = await api.delete(`/reservas/${idReserva}`);
    return resultado.data;
}

// todas las reservas de un día, solo para admin (fecha en DD-MM-AAAA)
export const agendaDelDiaApi = async (fecha) => {
    const resultado = await api.get("/reservas/agenda", { params: { fecha } });
    return resultado.data;
}

// Datos para el informe de reservas por categoría de admin
export const informeReservasPorCategoriaApi = async () => {
  const resultado = await api.get(
    "/reservas/informes/categorias",
  );

  return resultado.data;
};
