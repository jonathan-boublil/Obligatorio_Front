import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lista: [],
  agenda: [],
  informe: [],
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
        eliminarReservaSlice: (state, action) => {
            const id = action.payload;
            state.lista = state.lista.filter((reserva) => reserva.id !== id);
        },
        //vuelve al estado inicial (se usa en el logout para no mezclar reservas entre usuarios)
        limpiarReservasSlice: () => {
            return initialState;
        },
        cargarAgendaSlice: (state, action) => {
            state.agenda = action.payload;
        },

        cargarInformeSlice: (state, action) => {
            state.informe = action.payload;
        },

        renombrarCategoriaEnReservasSlice: (state, action) => {
            const { nombreAnterior, nombreNuevo } = action.payload;

            state.agenda.forEach((reserva) => {
                if (reserva.categoriaId?.nombre === nombreAnterior) {
                    reserva.categoriaId.nombre = nombreNuevo;
                }
            });
            state.informe.forEach((categoria) => {
                if (categoria.nombre === nombreAnterior) {
                    categoria.nombre = nombreNuevo;
                }
            });
            state.lista.forEach((reserva) => {
                if (reserva.categoriaId?.nombre === nombreAnterior) {
                    reserva.categoriaId.nombre = nombreNuevo;
                }
            });
        },
    },
});


export const {
  cargarReservasInicialesSlice,
  agregarReservaSlice,
  actualizarReservaSlice,
  eliminarReservaSlice,
  limpiarReservasSlice,
  cargarAgendaSlice,
  cargarInformeSlice,
  renombrarCategoriaEnReservasSlice,
} = reservaSlice.actions;
export default reservaSlice.reducer;
