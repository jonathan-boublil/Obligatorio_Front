import { useId, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { obtenerMensajeError } from "../services/mensajeError";
import { editarClienteApi, eliminarClienteApi } from "../services/userServices";
import { actualizarUserSlice, eliminarUserSlice } from "../redux/features/usersSlice";

const clienteVacio = {
    name: "",
    username: "",
    email: "",
};

// deja los clientes cuyo nombre de usuario contiene el texto, sin importar mayúsculas
const filtrarClientes = (lista, texto) => {
    if (texto.trim() === "") {
        return lista;
    }
    return lista?.filter((cliente) =>
        cliente.username.toLowerCase().includes(texto.trim().toLowerCase()),
    );
};

// Tabla de clientes con filtro por nombre de usuario, edición en la misma fila y eliminación
// (los clientes vienen de Redux)
const ListaClientes = () => {
    const dispatch = useDispatch();
    const listaClientes = useSelector((state) => state.usersSlice);

    const [listaClientesFiltrados, setListaClientesFiltrados] = useState([]);
    //se guarda el texto del filtro para volver a aplicarlo cuando cambia la lista (al editar o eliminar)
    const textoFiltro = useRef("");

    // id de la fila que se está editando / eliminando (null si ninguna)
    const [editandoId, setEditandoId] = useState(null);
    const [eliminandoId, setEliminandoId] = useState(null);
    const [valoresEdicion, setValoresEdicion] = useState(clienteVacio);
    const [guardando, setGuardando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    //cuando cambia la lista en Redux se vuelve a aplicar el filtro
    useEffect(() => {
        setListaClientesFiltrados(filtrarClientes(listaClientes, textoFiltro.current));
    }, [listaClientes]);

    const idInputFiltro = useId();

    //cada vez que se escribe una letra se filtran los clientes por nombre de usuario
    const handlerFilter = (e) => {
        const textoAFiltrar = e.target.value;
        textoFiltro.current = textoAFiltrar;
        setListaClientesFiltrados(filtrarClientes(listaClientes, textoAFiltrar));
    };

    //la fila pasa a tener inputs con los datos actuales del cliente (el plan no se edita)
    const empezarEdicion = (cliente) => {
        setMensajeError("");
        setEliminandoId(null);
        setEditandoId(cliente.id);
        setValoresEdicion({
            name: cliente.name,
            username: cliente.username,
            email: cliente.email,
        });
    };

    const empezarEliminacion = (cliente) => {
        setMensajeError("");
        setEditandoId(null);
        setEliminandoId(cliente.id);
    };

    const cancelar = () => {
        setMensajeError("");
        setEditandoId(null);
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
            const clienteActualizado = await editarClienteApi(editandoId, {
                name: valoresEdicion.name.trim(),
                username: valoresEdicion.username.trim(),
                email: valoresEdicion.email.trim(),
            });
            //se actualiza en Redux con lo que devolvió el back
            dispatch(actualizarUserSlice(clienteActualizado));
            setEditandoId(null);
        } catch (error) {
            //si falla la fila sigue en edición para poder corregir
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo editar el cliente."));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarCliente = async () => {
        setMensajeError("");
        setGuardando(true);
        try {
            await eliminarClienteApi(eliminandoId);
            dispatch(eliminarUserSlice(eliminandoId));
            setEliminandoId(null);
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo eliminar el cliente."));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            {mensajeError && (
                <div className="alert alert-danger" role="alert">
                    {mensajeError}
                </div>
            )}

            <div className="booking-field">
                <label className="booking-label" htmlFor={idInputFiltro}>
                    Filtrar por nombre de usuario
                </label>
                <input
                    id={idInputFiltro}
                    className="form-control booking-input"
                    type="text"
                    placeholder="Escribí el nombre de usuario"
                    onChange={handlerFilter}
                />
            </div>

            {listaClientes.length === 0 ? (
                <p className="mb-0">Todavía no hay clientes registrados.</p>
            ) : listaClientesFiltrados.length === 0 ? (
                <p className="mb-0">No hay clientes con ese nombre de usuario.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Plan</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaClientesFiltrados?.map((cliente) => {
                                const enEdicion = cliente.id === editandoId;
                                const enEliminacion = cliente.id === eliminandoId;

                                return (
                                    <tr key={cliente.id} className={enEliminacion ? "table-danger" : ""}>
                                        {/* usuario, nombre y email se vuelven editables en la fila que se está editando */}
                                        <td>
                                            {enEdicion ? (
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="text"
                                                    name="username"
                                                    aria-label="Nombre de usuario"
                                                    value={valoresEdicion.username}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                cliente.username
                                            )}
                                        </td>
                                        <td>
                                            {enEdicion ? (
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="text"
                                                    name="name"
                                                    aria-label="Nombre"
                                                    maxLength="30"
                                                    value={valoresEdicion.name}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                cliente.name
                                            )}
                                        </td>
                                        <td>
                                            {enEdicion ? (
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="email"
                                                    name="email"
                                                    aria-label="Email"
                                                    value={valoresEdicion.email}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                cliente.email
                                            )}
                                        </td>
                                        {/* el plan no se edita */}
                                        <td className="text-capitalize">{cliente.plan}</td>
                                        <td>
                                            <div className="d-flex gap-1 justify-content-end">
                                                {enEdicion ? (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            type="button"
                                                            disabled={guardando || !edicionCompleta}
                                                            onClick={guardarCliente}
                                                        >
                                                            {guardando ? "Guardando..." : "Guardar"}
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
                                                ) : enEliminacion ? (
                                                    <>
                                                        {/* se pide confirmar porque también se borran sus reservas */}
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
                                                    <>
                                                        <button
                                                            className="btn btn-outline-success btn-sm"
                                                            type="button"
                                                            disabled={guardando}
                                                            onClick={() => empezarEdicion(cliente)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            type="button"
                                                            disabled={guardando}
                                                            onClick={() => empezarEliminacion(cliente)}
                                                        >
                                                            Eliminar
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
        </>
    );
};

export default ListaClientes;
