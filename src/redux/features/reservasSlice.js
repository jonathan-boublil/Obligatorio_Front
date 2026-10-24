import { createSlice } from "@reduxjs/toolkit";

const initialState = []

const reservaSlice = createSlice({
    name: "reservaSlice",
    initialState,
    reducers: {
        // cargarReservasInicialesSlice: (state, action) => {
        //     const listaReservas = action.payload;
        //     return listaReservas;
        // },
        // changeCheckedSlice: (state, action) => {
        //     const { id, checked } = action.payload;
        //     console.log(`Reserva ${id} - ${checked}`);
        //     state.find((reserva) => reserva.id === id).completed = checked; //validar que encontro la reserva
        // },
        // agregarReservaSlice: (state, action) => {
        //     const reserva = action.payload;
        //     state.push(reserva)
        // },
        // borrarReservaSlice: (state, action) => {
        //     const id = action.payload;
        //     const stateAux = state.filter((reserva) => reserva.id !== id);
        //     return stateAux;
        // },
    },
});


export const { cargarReservasInicialesSlice, changeCheckedSlice, agregarReservaSlice, borrarReservaSlice } =
    reservaSlice.actions;
export default reservaSlice.reducer;