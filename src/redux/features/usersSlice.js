import { createSlice } from "@reduxjs/toolkit";

const initialState = [] 

const usersSlice = createSlice({
    name: "usersSlice",
    initialState,
    reducers: {
        cargaInicialUsersSlice: (state, action) => {
            const listaUsuarios = action.payload;
            return listaUsuarios;
        },
        crearUserSlice: (state, action) => {
            const usuario = action.payload;
            state.push(usuario);

        },
        //reemplaza el usuario por el que devolvió el back después de editarlo
        actualizarUserSlice: (state, action) => {
            const usuarioActualizado = action.payload;
            const indice = state.findIndex((usuario) => usuario.id === usuarioActualizado.id);
            if (indice !== -1) {
                state[indice] = usuarioActualizado;
            }
        },
        eliminarUserSlice: (state, action) => {
            const id = action.payload;
            const stateAux = state.filter((usuario) => usuario.id !== id);
            return stateAux;
        }
    }
})

export const { cargaInicialUsersSlice, crearUserSlice, actualizarUserSlice, eliminarUserSlice } = usersSlice.actions;
export default usersSlice.reducer;