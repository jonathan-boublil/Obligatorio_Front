import { useDispatch, useSelector } from "react-redux";
import {
    cargarReservasInicialesSlice,
    actualizarReservaSlice,
    eliminarReservaSlice,
} from "../redux/features/reservasSlice";
import { useEffect, useState } from "react";
import { obtenerMensajeError } from "../services/mensajeError";
import { listarReservasApi } from "../services/userServices";
import { reprogramarReservaApi, eliminarReservaApi } from "../services/reservaServices";
import { horarios, fechaParaBack, fechaDelBack, obtenerFechasDisponibles, validarFecha } from "../services/fechasReserva";

// la fecha viene en UTC desde el back, se muestra tal cual sin correrla por la zona horaria
const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-UY", { timeZone: "UTC" });
};

// Reservas del usuario logueado, con edición en la misma fila y eliminación.
// "actualizar" cambia cada vez que se crea una reserva nueva, para volver a pedir la lista
const MisReservas = ({ actualizar }) => {
    const dispatch = useDispatch();
    const reservas = useSelector(
        (state) => state.reservaSlice.lista,
    );
    
    // "lista" | "eliminar"
    const [vista, setVista] = useState("lista");
    const [filtroMascota, setFiltroMascota] = useState("");

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    // id de la fila que se está editando (null si ninguna) y los nuevos valores
    const [editandoId, setEditandoId] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState("");
    const [nuevaHora, setNuevaHora] = useState("");
    const [nuevoNombreMascota, setNuevoNombreMascota] = useState("");
    const [errorFecha, setErrorFecha] = useState("");

    // reserva que se va a eliminar
    const [reservaElegida, setReservaElegida] = useState(null);

    const fechasDisponibles = obtenerFechasDisponibles();
    const fechaMinima = fechasDisponibles[0];
    const fechaMaxima = fechasDisponibles[fechasDisponibles.length - 1];

    //se piden las reservas al mostrar la lista y cada vez que se crea una reserva nueva
    useEffect(() => {
        const cargarReservas = async () => {
            setCargando(true);
            setMensajeError("");

            try {
                const lista = await listarReservasApi();
                dispatch(cargarReservasInicialesSlice(lista));
            } catch (error) {
                setMensajeError(
                    obtenerMensajeError(
                        error,
                        "No se pudieron cargar las reservas.",
                    ),
                );
            } finally {
                setCargando(false);
            }
        };

        cargarReservas();
    }, [actualizar, dispatch]);

    //la fila pasa a tener inputs con la fecha, hora y nombre de mascota actuales de la reserva
    const empezarEdicion = (reserva) => {
        setMensajeError("");
        setEditandoId(reserva.id);
        setNuevaFecha(fechaDelBack(reserva.fecha));
        setNuevaHora(reserva.hora);
        setNuevoNombreMascota(reserva.nombreMascota);
        setErrorFecha("");
    };

    const cancelarEdicion = () => {
        setMensajeError("");
        setEditandoId(null);
        setErrorFecha("");
    };

    const abrirEliminar = (reserva) => {
        setMensajeError("");
        setEditandoId(null);
        setReservaElegida(reserva);
        setVista("eliminar");
    };

    //al volver a la lista se vuelve a pedir al back con los cambios
    const volverALista = () => {
        setMensajeError("");
        setReservaElegida(null);
        setVista("lista");
    };

    const nuevaFechaHandler = (e) => {
        const fecha = e.target.value;
        const error = validarFecha(fecha, fechaMinima, fechaMaxima);

        setErrorFecha(error);
        setNuevaFecha(error ? "" : fecha);
    };

    const guardarReserva = async () => {
        setMensajeError("");
        setGuardando(true);
        try {
            //el nombre se manda solo si cambió (si no, axios omite el campo undefined)
            const reservaOriginal = reservas.find((reserva) => reserva.id === editandoId);
            const nombreMascota = nuevoNombreMascota.trim();

            const reservaEditada = await reprogramarReservaApi(
                editandoId,
                fechaParaBack(nuevaFecha),
                nuevaHora,
                nombreMascota !== reservaOriginal.nombreMascota ? nombreMascota : undefined
            );
            //se actualiza solo esa fila con lo que devolvió el back, sin volver a pedir toda la lista
            dispatch(
                actualizarReservaSlice({
                    id: editandoId,
                    fecha: reservaEditada.fecha,
                    hora: reservaEditada.hora,
                    nombreMascota: reservaEditada.nombreMascota,
                }),
            );
            setEditandoId(null);
        } catch (error) {
            //si falla la fila sigue en edición para poder corregir
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo editar la reserva."));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarReserva = async () => {
        setMensajeError("");
        setCargando(true);
        try {
            await eliminarReservaApi(reservaElegida.id);
            dispatch(eliminarReservaSlice(reservaElegida.id));
            volverALista();
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo eliminar la reserva."));
        } finally {
            setCargando(false);
        }
    };

    const subtitulos = {
        lista: "Consultá, editá o eliminá tus reservas",
        eliminar: "Eliminar reserva",
    };

    //Logica de filtro de mascota
    const handlerFilter = (e) => {
        setFiltroMascota(e.target.value);
    };
    const reservasFiltradas = reservas.filter((reserva) =>
        reserva.nombreMascota
            .toLowerCase()
            .includes(filtroMascota.toLowerCase()),
    );

    return (
        <section id="mis-reservas" className="booking-section">
            <div className="container">
                <div className="section-heading">
                    <h2>Mis reservas</h2>

                    <p>{subtitulos[vista]}</p>
                </div>

                {vista === "lista" && (
                    <div className="admin-card mx-auto mb-4">
                        <label
                            className="booking-label"
                            htmlFor="filtroMascota"
                        >
                            Filtrar por mascota
                        </label>

                        <input
                            id="filtroMascota"
                            className="form-control booking-input"
                            type="text"
                            placeholder="Nombre de la mascota"
                            value={filtroMascota}
                            onChange={handlerFilter}
                        />
                    </div>
                )}

                <div className="booking-card admin-card">
                    {mensajeError && (
                        <div className="alert alert-danger" role="alert">
                            {mensajeError}
                        </div>
                    )}

                    {/* Lista de reservas */}
                    {vista === "lista" && (
                        <>
                            {cargando ? (
                                <p className="mb-0">Cargando reservas...</p>
                                ) : reservas.length === 0 ? (
                                <p className="mb-0">
                                    Todavía no tenés reservas.
                                </p>
                                ) : reservasFiltradas.length === 0 ? (
                                <p className="mb-0">
                                    No se encontraron reservas para esa mascota.
                                </p>
                                ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Servicio</th>
                                                <th>Mascota</th>
                                                <th>Estado</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reservasFiltradas.map((reserva) => {
                                                const enEdicion = reserva.id === editandoId;

                                                return (
                                                    <tr key={reserva.id}>
                                                        {/* fecha y hora se vuelven editables en la fila que se está editando */}
                                                        <td>
                                                            {enEdicion ? (
                                                                <>
                                                                    <input
                                                                        className={`form-control form-control-sm ${errorFecha ? "is-invalid" : ""}`}
                                                                        type="date"
                                                                        aria-label="Nueva fecha"
                                                                        min={fechaMinima}
                                                                        max={fechaMaxima}
                                                                        value={nuevaFecha}
                                                                        onChange={nuevaFechaHandler}
                                                                    />
                                                                    {errorFecha && <div className="invalid-feedback">{errorFecha}</div>}
                                                                </>
                                                            ) : (
                                                                formatearFecha(reserva.fecha)
                                                            )}
                                                        </td>
                                                        <td>
                                                            {enEdicion ? (
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    aria-label="Nuevo horario"
                                                                    value={nuevaHora}
                                                                    onChange={(e) => setNuevaHora(e.target.value)}
                                                                >
                                                                    <option value="">Horario</option>
                                                                    {horarios.map((horario) => (
                                                                        <option key={horario}>{horario}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                reserva.hora
                                                            )}
                                                        </td>
                                                        <td className="text-capitalize">{reserva.categoriaId?.nombre}</td>
                                                        <td>
                                                            {enEdicion ? (
                                                                <input
                                                                    className="form-control form-control-sm"
                                                                    type="text"
                                                                    aria-label="Nombre de la mascota"
                                                                    maxLength="50"
                                                                    value={nuevoNombreMascota}
                                                                    onChange={(e) => setNuevoNombreMascota(e.target.value)}
                                                                />
                                                            ) : (
                                                                reserva.nombreMascota
                                                            )}
                                                        </td>
                                                        <td className="text-capitalize">{reserva.estado}</td>
                                                        <td>
                                                            <div className="d-flex gap-1 justify-content-end">
                                                                {enEdicion ? (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-success btn-sm"
                                                                            type="button"
                                                                            disabled={guardando || !nuevaFecha || !nuevaHora || nuevoNombreMascota.trim() === ""}
                                                                            onClick={guardarReserva}
                                                                        >
                                                                            {guardando ? "Guardando..." : "Guardar"}
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline-secondary btn-sm"
                                                                            type="button"
                                                                            disabled={guardando}
                                                                            onClick={cancelarEdicion}
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
                                                                            onClick={() => empezarEdicion(reserva)}
                                                                        >
                                                                            Editar
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            type="button"
                                                                            disabled={guardando}
                                                                            onClick={() => abrirEliminar(reserva)}
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
                    )}

                    {/* Confirmación para eliminar una reserva */}
                    {vista === "eliminar" && reservaElegida && (
                        <>
                            <p>
                                ¿Seguro que quiere eliminar la reserva de {reservaElegida.nombreMascota} del
                                {" "}{formatearFecha(reservaElegida.fecha)} a las {reservaElegida.hora}?
                            </p>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    disabled={cargando}
                                    onClick={volverALista}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    type="button"
                                    disabled={cargando}
                                    onClick={eliminarReserva}
                                >
                                    {cargando ? "Eliminando..." : "Eliminar"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MisReservas;
