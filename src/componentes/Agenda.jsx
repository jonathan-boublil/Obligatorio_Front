import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { obtenerMensajeError } from "../services/mensajeError";
import { agendaDelDiaApi } from "../services/reservaServices";
import { formatearFecha, fechaParaBack, reservaYaPaso } from "../services/fechasReserva";
import { cargarAgendaSlice } from "../redux/features/reservasSlice";

// Agenda del día para el admin: todas las reservas de la fecha elegida
const Agenda = () => {
    const dispatch = useDispatch();
    const reservas = useSelector((state) => state.reservaSlice.agenda);

    const [fecha, setFecha] = useState(formatearFecha(new Date()));
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Agenda;
