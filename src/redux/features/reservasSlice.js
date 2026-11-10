import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lista: [],
  agenda: [],
  // reservas de todo el sistema para el gráfico del admin: [{ categoriaId: { nombre }, cliente: id }]
  informe: [],
  // ids de los clientes tildados en la lista de Clientes; vacío = el gráfico muestra el total del sistema
  clientesSeleccionados: [],
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
            state.informe.forEach((reserva) => {
                if (reserva.categoriaId?.nombre === nombreAnterior) {
                    reserva.categoriaId.nombre = nombreNuevo;
                }
            });
            state.lista.forEach((reserva) => {
                if (reserva.categoriaId?.nombre === nombreAnterior) {
                    reserva.categoriaId.nombre = nombreNuevo;
                }
            });
        },

        //tilda o destilda un cliente en la lista de Clientes (el gráfico suma los tildados)
        alternarClienteInformeSlice: (state, action) => {
            const idCliente = action.payload;
            if (state.clientesSeleccionados.includes(idCliente)) {
                state.clientesSeleccionados = state.clientesSeleccionados.filter((id) => id !== idCliente);
            } else {
                state.clientesSeleccionados.push(idCliente);
            }
        },
        //destilda un cliente (se usa al eliminarlo, para que no quede seleccionado un cliente que ya no existe)
        quitarClienteInformeSlice: (state, action) => {
            const idCliente = action.payload;
            state.clientesSeleccionados = state.clientesSeleccionados.filter((id) => id !== idCliente);
        },
        //destilda todos: el gráfico vuelve a mostrar el total del sistema
        limpiarClientesInformeSlice: (state) => {
            state.clientesSeleccionados = [];
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
  alternarClienteInformeSlice,
  quitarClienteInformeSlice,
  limpiarClientesInformeSlice,
} = reservaSlice.actions;
export default reservaSlice.reducer;



// selector para el gráfico de Informes (igual que filtrarTareasPorSearch de la clase):
// devuelve las reservas del informe filtradas por los clientes tildados en la lista de Clientes.
// state se lo pasa el useSelector
export const filtrarInformePorClientes = (state) => {
    const clientesSeleccionados = state.reservaSlice.clientesSeleccionados;
    const informe = state.reservaSlice.informe;

    if (clientesSeleccionados.length === 0) {
        return informe;
    } else {
        const auxInformeFiltrado = informe.filter((reserva) =>
            clientesSeleccionados.includes(reserva.cliente),
        );
        return auxInformeFiltrado;
    }
};
