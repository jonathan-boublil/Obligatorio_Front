import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    lista: [],
};

const reservaSlice = createSlice({
    name: "reservaSlice",
    initialState,
    reducers: {
        cargarReservasInicialesSlice: (state, action) => {
            const listaReservas = action.payload;
            state.lista = listaReservas;
        },
        actualizarReservaSlice: (state, action) => {
            const reservaActualizada = action.payload;

            const reserva = state.lista.find(
                (item) => item.id === reservaActualizada.id,
            );

            if (reserva) {
                Object.assign(reserva, reservaActualizada);
            }
        },
        eliminarReservaSlice: (state, action) => {
            const idReserva = action.payload;

            state.lista = state.lista.filter((reserva) => reserva.id !== idReserva);
        },
        limpiarReservasSlice: () => {
            return initialState;
        },
    },
});


export const { cargarReservasInicialesSlice, actualizarReservaSlice, eliminarReservaSlice, limpiarReservasSlice } =
    reservaSlice.actions;
export default reservaSlice.reducer;