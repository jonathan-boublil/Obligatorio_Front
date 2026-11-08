import { createSlice } from "@reduxjs/toolkit";

const initialState = []

// categorías (servicios) que creó el admin: las usan Categorias (admin), Reserva y MisReservas (cliente)
const categoriasSlice = createSlice({
    name: "categoriasSlice",
    initialState,
    reducers: {
        cargaInicialCategoriasSlice: (state, action) => {
            const listaCategorias = action.payload;
            return listaCategorias;
        },
        crearCategoriaSlice: (state, action) => {
            const categoria = action.payload;
            state.push(categoria);
        },
        //reemplaza la categoría por la que devolvió el back después de editarla
        actualizarCategoriaSlice: (state, action) => {
            const categoriaActualizada = action.payload;
            const indice = state.findIndex((categoria) => categoria.id === categoriaActualizada.id);
            if (indice !== -1) {
                state[indice] = categoriaActualizada;
            }
        },
        eliminarCategoriaSlice: (state, action) => {
            const id = action.payload;
            const stateAux = state.filter((categoria) => categoria.id !== id);
            return stateAux;
        }
    }
})

export const { cargaInicialCategoriasSlice, crearCategoriaSlice, actualizarCategoriaSlice, eliminarCategoriaSlice } = categoriasSlice.actions;
export default categoriasSlice.reducer;
