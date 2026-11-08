import { createSlice } from "@reduxjs/toolkit";

// la lista va dentro de un objeto para poder sumar más datos al slice más adelante (ej: cargando)
const initialState = {
    lista: [],
};

// reservas del cliente logueado: las usa Reserva (para el límite anual del plan) y MisReservas (la lista)
const reservaSlice = createSlice({
    name: "reservaSlice",
    initialState,
    reducers: {
        cargarReservasInicialesSlice: (state, action) => {
            const listaReservas = action.payload;
            state.lista = listaReservas;
        },
        agregarReservaSlice: (state, action) => {
            const reserva = action.payload;
            state.lista.push(reserva);
        },
        //reemplaza la reserva por la que devolvió el back después de editarla
        actualizarReservaSlice: (state, action) => {
            const reservaActualizada = action.payload;
            const indice = state.lista.findIndex((reserva) => reserva.id === reservaActualizada.id);
            if (indice !== -1) {
                state.lista[indice] = reservaActualizada;
            }
        },
        borrarReservaSlice: (state, action) => {
            const id = action.payload;
            state.lista = state.lista.filter((reserva) => reserva.id !== id);
        },
        //vuelve al estado inicial (se usa en el logout para no mezclar reservas entre usuarios)
        limpiarReservasSlice: () => {
            return initialState;
        },
    },
});


export const { cargarReservasInicialesSlice, agregarReservaSlice, actualizarReservaSlice, borrarReservaSlice, limpiarReservasSlice } =
    reservaSlice.actions;
export default reservaSlice.reducer;
