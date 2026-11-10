import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { obtenerMensajeError } from "../services/mensajeError";
import { agendaDelDiaApi } from "../services/reservaServices";
import { formatearFecha, fechaParaBack, reservaYaPaso } from "../services/fechasReserva";
import { cargarAgendaSlice } from "../redux/features/reservasSlice";

// la fecha viene en UTC desde el back, se muestra tal cual sin correrla por la zona horaria
const mostrarFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-UY", { timeZone: "UTC" });
};

// ícono del botón "Ver reserva" (mismo estilo que los de Mis reservas)
const EyeIcon = () => {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
};

// Agenda del día para el admin: todas las reservas de la fecha elegida
const Agenda = () => {
    const dispatch = useDispatch();
    const reservas = useSelector((state) => state.reservaSlice.agenda);

    const [fecha, setFecha] = useState(formatearFecha(new Date()));
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");
    // reserva que se está viendo completa (solo lectura); null si la ventana está cerrada
    const [reservaVista, setReservaVista] = useState(null);

    //cada vez que cambia el día se piden las reservas de ese día
    useEffect(() => {
        if (!fecha) {
            dispatch(cargarAgendaSlice([]));
            return;
        }

        const cargarAgenda = async () => {
            setMensajeError("");
            setCargando(true);
            try {
                const lista = await agendaDelDiaApi(fechaParaBack(fecha));
                dispatch(cargarAgendaSlice(lista));
            } catch (error) {
                console.error(error);
                setMensajeError(obtenerMensajeError(error, "No se pudo cargar la agenda."));
                dispatch(cargarAgendaSlice([]));
            } finally {
                setCargando(false);
            }
        };

        cargarAgenda();
    }, [fecha, dispatch]);

    return (
        <section id="agenda" className="booking-section">
            <div className="container">
                <div className="section-heading">
                    <h2>Agenda</h2>

                    <p>Reservas agendadas para el día seleccionado</p>
                </div>

                <div className="booking-card admin-card">
                    {mensajeError && (
                        <div className="alert alert-danger" role="alert">
                            {mensajeError}
                        </div>
                    )}

                    <div className="booking-field">
                        <label className="booking-step-title" htmlFor="agendaFecha">
                            Día
                        </label>
                        <input
                            id="agendaFecha"
                            className="form-control booking-input"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                        />
                    </div>

                    {cargando ? (
                        <p className="mb-0">Cargando reservas...</p>
                    ) : reservas.length === 0 ? (
                        <p className="mb-0">No hay reservas agendadas para este día.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Cliente</th>
                                        <th>Servicio</th>
                                        <th>Mascota</th>
                                        <th>Estado</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservas.map((reserva) => (
                                        <tr key={reserva.id}>
                                            <td>{reserva.hora}</td>
                                            <td>{reserva.cliente?.name}</td>
                                            <td className="text-capitalize">{reserva.categoriaId?.nombre}</td>
                                            <td>{reserva.nombreMascota}</td>
                                            {/* si el día y la hora ya pasaron, la reserva figura como finalizada */}
                                            {reservaYaPaso(reserva.fecha, reserva.hora) ? (
                                                <td className="text-muted">Finalizada</td>
                                            ) : (
                                                <td className="text-capitalize">{reserva.estado}</td>
                                            )}
                                            <td>
                                                {/* abre la reserva completa en solo lectura; el admin no la puede editar */}
                                                <div className="d-flex justify-content-end">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm accion-icono"
                                                        type="button"
                                                        data-tooltip="Ver reserva"
                                                        aria-label="Ver reserva"
                                                        onClick={() => setReservaVista(reserva)}
                                                    >
                                                        <EyeIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reserva completa en solo lectura (datos que ya vienen en la agenda); se cierra con la cruz o haciendo clic afuera */}
            {reservaVista && (
                <>
                    {/* el div.modal ocupa toda la pantalla: si el clic cae afuera del cuadro, se cierra */}
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reservaAgendaTitle"
                        onClick={(e) => e.target === e.currentTarget && setReservaVista(null)}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2 id="reservaAgendaTitle" className="modal-title fs-5">
                                        Reserva de {reservaVista.nombreMascota}
                                    </h2>
                                    <button
                                        className="btn-close"
                                        type="button"
                                        aria-label="Cerrar"
                                        onClick={() => setReservaVista(null)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <dl className="row mb-0">
                                        <dt className="col-sm-4">Cliente</dt>
                                        <dd className="col-sm-8">
                                            {reservaVista.cliente?.name}
                                            {reservaVista.cliente?.username && (
                                                <span className="text-muted"> ({reservaVista.cliente.username})</span>
                                            )}
                                        </dd>

                                        <dt className="col-sm-4">Fecha</dt>
                                        <dd className="col-sm-8">{mostrarFecha(reservaVista.fecha)}</dd>

                                        <dt className="col-sm-4">Hora</dt>
                                        <dd className="col-sm-8">{reservaVista.hora}</dd>

                                        <dt className="col-sm-4">Servicio</dt>
                                        <dd className="col-sm-8 text-capitalize">{reservaVista.categoriaId?.nombre}</dd>

                                        <dt className="col-sm-4">Estado</dt>
                                        <dd className="col-sm-8 text-capitalize">
                                            {reservaYaPaso(reservaVista.fecha, reservaVista.hora) ? "Finalizada" : reservaVista.estado}
                                        </dd>

                                        <dt className="col-sm-4">Mascota</dt>
                                        <dd className="col-sm-8">{reservaVista.nombreMascota}</dd>

                                        <dt className="col-sm-4">Tipo</dt>
                                        <dd className="col-sm-8">{reservaVista.mascota}</dd>

                                        <dt className="col-sm-4">Edad</dt>
                                        <dd className="col-sm-8">
                                            {reservaVista.edadMascota} {reservaVista.edadMascota === 1 ? "año" : "años"}
                                        </dd>

                                        {/* para el veterinario lo más útil es el motivo profesional que genera la IA */}
                                        <dt className="col-sm-4">Motivo profesional</dt>
                                        <dd className="col-sm-8">{reservaVista.motivoProfesional ?? reservaVista.motivo}</dd>

                                        <dt className="col-sm-4">Motivo del cliente</dt>
                                        <dd className="col-sm-8">{reservaVista.motivo}</dd>

                                        {reservaVista.imageUrl && (
                                            <>
                                                <dt className="col-sm-4">Imagen</dt>
                                                <dd className="col-sm-8">
                                                    <img
                                                        className="booking-image-preview"
                                                        src={reservaVista.imageUrl}
                                                        alt={`Foto de ${reservaVista.nombreMascota}`}
                                                    />
                                                </dd>
                                            </>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-backdrop fade show" onClick={() => setReservaVista(null)} />
                </>
            )}
        </section>
    );
};

export default Agenda;
