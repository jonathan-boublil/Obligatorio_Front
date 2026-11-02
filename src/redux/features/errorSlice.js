import { createSlice } from "@reduxjs/toolkit";

// mensaje del error que se muestra en la ventana, null cuando no hay error
const initialState = null

const errorSlice = createSlice({
    name: "errorSlice",
    initialState,
    reducers: {
        mostrarErrorSlice: (state, action) => {
            const mensaje = action.payload;
            return mensaje;
        },
        cerrarErrorSlice: () => {
            return null;
        }
    }
})

export const { mostrarErrorSlice, cerrarErrorSlice } = errorSlice.actions;
export default errorSlice.reducer;
