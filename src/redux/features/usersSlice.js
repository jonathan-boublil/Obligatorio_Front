import { createSlice } from "@reduxjs/toolkit";

const initialState = [] 

const usersSlice = createSlice({
    name: "usersSlice",
    initialState,
    reducers: {
        cargaInicialUsersSlice: (state, action) => {
            const listaUsuarios = action.payload;
            // console.log('listaUsuarios', listaUsuarios)
            return listaUsuarios;
        },
        crearUserSlice: (state, action) => {
            const usuario = action.payload;
            state.push(usuario);

        }
    }
})

export const { cargaInicialUsersSlice, crearUserSlice } = usersSlice.actions;
export default usersSlice.reducer;