import { createSlice } from "@reduxjs/toolkit";

const initialState = []

const reservaSlice = createSlice({
    name: "reservaSlice",
    initialState,
    reducers: {
        // cargarTareasInicialesSlice: (state, action) => {
        //     const listaTareas = action.payload;
        //     return listaTareas;
        // },
        // changeCheckedSlice: (state, action) => {
        //     const { id, checked } = action.payload;
        //     console.log(`Tarea ${id} - ${checked}`);
        //     state.find((tarea) => tarea.id === id).completed = checked; //validar que encontro la tarea
        // },
        // agregarTareaSlice: (state, action) => {
        //     const tarea = action.payload;
        //     state.push(tarea)
        // },
        // borrarTareaSlice: (state, action) => {
        //     const id = action.payload;
        //     const stateAux = state.filter((tarea) => tarea.id !== id);
        //     return stateAux;
        // },
    },
});


export const { cargarTareasInicialesSlice, changeCheckedSlice, agregarTareaSlice, borrarTareaSlice } =
    reservaSlice.actions;
export default reservaSlice.reducer;