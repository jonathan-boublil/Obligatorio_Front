import { useId, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { obtenerMensajeError } from "../services/mensajeError";
import { editarClienteApi, eliminarClienteApi } from "../services/userServices";
import { actualizarUserSlice, eliminarUserSlice } from "../redux/features/usersSlice";
import { alternarClienteInformeSlice, quitarClienteInformeSlice } from "../redux/features/reservasSlice";
import { PencilIcon, TrashIcon } from "./Iconos";

const clienteVacio = {
    name: "",
    username: "",
    email: "",
};

// deja los clientes cuyo nombre contiene el texto, sin importar mayúsculas
const filtrarClientes = (lista, texto) => {
    if (texto.trim() === "") {
        return lista;
    }
    return lista?.filter((cliente) =>
        cliente.name.toLowerCase().includes(texto.trim().toLowerCase()),
    );
};

// Tabla de clientes con filtro por nombre, casilla para el gráfico de Informes, edición y eliminación.
// La tabla muestra solo usuario y nombre; el lápiz abre una ventana con todos los datos para editarlos
// (los clientes vienen de Redux)
const ListaClientes = () => {
    const dispatch = useDispatch();
    const listaClientes = useSelector((state) => state.usersSlice);
    //clientes tildados para el gráfico de Informes (la selección está en Redux porque la usan los dos componentes)
    const clientesSeleccionados = useSelector((state) => state.reservaSlice.clientesSeleccionados);

    const [listaClientesFiltrados, setListaClientesFiltrados] = useState([]);
    //se guarda el texto del filtro para volver a aplicarlo cuando cambia la lista (al editar o eliminar)
    const textoFiltro = useRef("");

    // cliente que se está editando en la ventana (null si está cerrada) y los nuevos valores
    const [clienteEditando, setClienteEditando] = useState(null);
    const [valoresEdicion, setValoresEdicion] = useState(clienteVacio);
    // id de la fila que se está eliminando (null si ninguna)
    const [eliminandoId, setEliminandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    //cuando cambia la lista en Redux se vuelve a aplicar el filtro
    useEffect(() => {
        setListaClientesFiltrados(filtrarClientes(listaClientes, textoFiltro.current));
    }, [listaClientes]);

    //el aviso verde de eliminación se oculta solo a los 4 segundos
    useEffect(() => {
        if (!mensajeExito) return;

        const timer = setTimeout(() => {
            setMensajeExito("");
        }, 4000);

        return () => {
            clearTimeout(timer);
        };
    }, [mensajeExito]);

    const idInputFiltro = useId();

    //cada vez que se escribe una letra se filtran los clientes por nombre
    const handlerFilter = (e) => {
        const textoAFiltrar = e.target.value;
        textoFiltro.current = textoAFiltrar;
        setListaClientesFiltrados(filtrarClientes(listaClientes, textoAFiltrar));
    };

    //ícono del lápiz: abre la ventana con todos los datos del cliente (el plan se muestra pero no se edita)
    const empezarEdicion = (cliente) => {
        setMensajeError("");
        setEliminandoId(null);
        setClienteEditando(cliente);
        setValoresEdicion({
            name: cliente.name,
            username: cliente.username,
            email: cliente.email,
        });
    };

    const empezarEliminacion = (cliente) => {
        setMensajeError("");
        setClienteEditando(null);
        setEliminandoId(cliente.id);
    };

    const cancelar = () => {
        setMensajeError("");
        setClienteEditando(null);
        setEliminandoId(null);
    };

    const handleChange = (e) => {
        const auxValores = { ...valoresEdicion };
        auxValores[e.target.name] = e.target.value;
        setValoresEdicion(auxValores);
    };

    const edicionCompleta =
        valoresEdicion.name.trim() !== "" &&
        valoresEdicion.username.trim() !== "" &&
        valoresEdicion.email.trim() !== "";

    const guardarCliente = async () => {
        setMensajeError("");
        setGuardando(true);
        try {
            const clienteActualizado = await editarClienteApi(clienteEditando.id, {
                name: valoresEdicion.name.trim(),
                username: valoresEdicion.username.trim(),
                email: valoresEdicion.email.trim(),
            });
            //se actualiza en Redux con lo que devolvió el back
            dispatch(actualizarUserSlice(clienteActualizado));
            setClienteEditando(null);
        } catch (error) {
            //si falla la ventana sigue abierta para poder corregir
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo editar el cliente."));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarCliente = async () => {
        //se guarda el nombre antes de sacarlo de Redux, para mostrarlo en el aviso
        const clienteEliminado = listaClientes.find((cliente) => cliente.id === eliminandoId);

        setMensajeError("");
        setMensajeExito("");
        setGuardando(true);
        try {
            await eliminarClienteApi(eliminandoId);
            dispatch(eliminarUserSlice(eliminandoId));
            //si estaba tildado para el gráfico, se destilda
            dispatch(quitarClienteInformeSlice(eliminandoId));
            setEliminandoId(null);
            setMensajeExito(`Usuario ${clienteEliminado?.name} borrado correctamente.`);
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo eliminar el cliente."));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            {/* los errores de la edición se muestran dentro de la ventana */}
            {mensajeError && !clienteEditando && (
                <div className="alert alert-danger" role="alert">
                    {mensajeError}
                </div>
            )}

            {mensajeExito && (
                <div className="alert alert-success" role="status">
                    {mensajeExito}
                </div>
            )}

            <div className="booking-field">
                <label className="booking-label" htmlFor={idInputFiltro}>
                    Filtrar por nombre
                </label>
                <input
                    id={idInputFiltro}
                    className="form-control booking-input"
                    type="text"
                    placeholder="Nombre"
                    onChange={handlerFilter}
                />
            </div>

            {listaClientes.length === 0 ? (
                <p className="mb-0">Todavía no hay clientes registrados.</p>
            ) : listaClientesFiltrados.length === 0 ? (
                <p className="mb-0">No hay clientes con ese nombre.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Gráfico</th>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaClientesFiltrados?.map((cliente) => {
                                const enEliminacion = cliente.id === eliminandoId;

                                return (
                                    <tr key={cliente.id} className={enEliminacion ? "table-danger" : ""}>
                                        {/* tildado = el gráfico de Informes incluye las reservas de este cliente */}
                                        <td>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                aria-label={`Mostrar las reservas de ${cliente.name} en el gráfico`}
                                                checked={clientesSeleccionados.includes(cliente.id)}
                                                onChange={() => dispatch(alternarClienteInformeSlice(cliente.id))}
                                            />
                                        </td>
                                        <td>{cliente.username}</td>
                                        <td>{cliente.name}</td>
                                        <td>
                                            <div className="d-flex gap-1 justify-content-end">
                                                {enEliminacion ? (
                                                    <>
                                                        {/* se pide confirmar antes de eliminar; si tiene reservas el back no lo permite y se muestra su mensaje */}
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            type="button"
                                                            disabled={guardando}
                                                            onClick={eliminarCliente}
                                                        >
                                                            {guardando ? "Eliminando..." : "Confirmar"}
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            type="button"
                                                            disabled={guardando}
                                                            onClick={cancelar}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    //acciones con íconos; el texto de "data-tooltip" aparece al pasar el mouse
                                                    <>
                                                        <button
                                                            className="btn btn-outline-success btn-sm accion-icono"
                                                            type="button"
                                                            data-tooltip="Editar"
                                                            aria-label={`Editar a ${cliente.name}`}
                                                            disabled={guardando}
                                                            onClick={() => empezarEdicion(cliente)}
                                                        >
                                                            <PencilIcon />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm accion-icono"
                                                            type="button"
                                                            data-tooltip="Eliminar"
                                                            aria-label={`Eliminar a ${cliente.name}`}
                                                            disabled={guardando}
                                                            onClick={() => empezarEliminacion(cliente)}
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ventana del lápiz: todos los datos del cliente; nombre, usuario y email se editan, el plan no */}
            {clienteEditando && (
                <>
                    {/* el div.modal ocupa toda la pantalla: si el clic cae afuera del cuadro, se cierra */}
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="editarClienteTitle"
                        onClick={(e) => e.target === e.currentTarget && !guardando && cancelar()}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2 id="editarClienteTitle" className="modal-title fs-5">
                                        Editar cliente
                                    </h2>
                                    <button
                                        className="btn-close"
                                        type="button"
                                        aria-label="Cerrar"
                                        disabled={guardando}
                                        onClick={cancelar}
                                    />
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        guardarCliente();
                                    }}
                                >
                                    <div className="modal-body">
                                        {mensajeError && (
                                            <div className="alert alert-danger" role="alert">
                                                {mensajeError}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="editarClienteNombre">Nombre</label>
                                            <input
                                                id="editarClienteNombre"
                                                className="form-control"
                                                type="text"
                                                name="name"
                                                maxLength="30"
                                                value={valoresEdicion.name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="editarClienteUsuario">Usuario</label>
                                            <input
                                                id="editarClienteUsuario"
                                                className="form-control"
                                                type="text"
                                                name="username"
                                                value={valoresEdicion.username}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="editarClienteEmail">Email</label>
                                            <input
                                                id="editarClienteEmail"
                                                className="form-control"
                                                type="email"
                                                name="email"
                                                value={valoresEdicion.email}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* el plan lo cambia el cliente desde Mis datos; el admin solo lo ve */}
                                        <div>
                                            <span className="form-label d-block">Plan</span>
                                            <span className="text-capitalize">{clienteEditando.plan}</span>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            disabled={guardando}
                                            onClick={cancelar}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            type="submit"
                                            disabled={guardando || !edicionCompleta}
                                        >
                                            {guardando ? "Guardando..." : "Guardar"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="modal-backdrop fade show" />
                </>
            )}
        </>
    );
};

export default ListaClientes;
