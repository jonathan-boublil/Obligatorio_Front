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

export const obtenerCategoriaApi = async (idCategoria) => {
    const resultado = await api.get(`/categorias/${idCategoria}`);
    return resultado.data;
}

// edita nombre y/o descripción de una categoría, solo para admin
export const editarCategoriaApi = async (idCategoria, datos) => {
    const resultado = await api.patch(`/categorias/${idCategoria}`, datos);
    return resultado.data.categoria;
}

// elimina una categoría, solo para admin (el back no lo permite si tiene reservas)
export const eliminarCategoriaApi = async (idCategoria) => {
    await api.delete(`/categorias/${idCategoria}`);
}

// crea una reserva del usuario logueado; devuelve la reserva creada
export const crearReservaApi = async (reserva) => {
    const resultado = await api.post("/reservas", reserva);
    return resultado.data.reserva;
}

// edita una reserva del usuario logueado: nuevaFecha (DD-MM-AAAA) y nuevaHora siempre,
// y opcionalmente nombreMascota, categoriaId, mascota, edadMascota, motivo, imageUrl + imagePublicId
export const reprogramarReservaApi = async (idReserva, datos) => {
    const resultado = await api.patch(`/reservas/${idReserva}`, datos);
    return resultado.data.reserva;
}

// una reserva del usuario logueado con todos sus datos (si no es suya el back responde 403)
export const obtenerReservaApi = async (idReserva) => {
    const resultado = await api.get(`/reservas/${idReserva}`);
    return resultado.data;
}

// QR de una reserva del usuario logueado para presentar en recepción; el back devuelve la imagen PNG
// (se pide con axios para que lleve el token, por eso no se puede poner la url directo en un <img>)
export const obtenerQrReservaApi = async (idReserva) => {
    const resultado = await api.get(`/reservas/${idReserva}/qr`, {
        responseType: "blob"
    });
    return resultado.data;
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

// horas ocupadas de un día para cualquier usuario logueado (fecha en DD-MM-AAAA), ej: ["09:00", "10:30"]
// el signal permite cancelar la petición si cambian la fecha antes de que responda
export const horariosOcupadosApi = async (fecha, signal) => {
    const resultado = await api.get("/reservas/horarios-ocupados", {
        params: { fecha },
        signal: signal
    });
    return resultado.data;
}

// Datos para el informe de reservas por categoría de admin
export const informeReservasPorCategoriaApi = async () => {
  const resultado = await api.get(
    "/reservas/informes/categorias",
  );

  return resultado.data;
};
