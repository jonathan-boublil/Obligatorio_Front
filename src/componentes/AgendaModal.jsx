import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Fecha LOCAL YYYY-MM-DD (sin UTC)
const fechaDeHoy = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const AgendaModal = () => {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(fechaDeHoy());

  //TODO: cuando esté el endpoint en el back, pedir las reservas del día seleccionado
  //(con un useEffect que dependa de [fecha]) y guardarlas en este estado
  const [reservas] = useState([]);

  const cerrarModal = () => {
    navigate("/");
  };

  return (
    <>
      <div
        id="agendaModal"
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="agendaModalTitle"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="agendaModalTitle"
                className="modal-title fs-4"
              >
                Agenda
              </h2>

              <button
                className="btn-close"
                type="button"
                aria-label="Cerrar"
                onClick={cerrarModal}
              />
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="agendaFecha">
                  Día
                </label>
                <input
                  id="agendaFecha"
                  className="form-control"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              {reservas.length === 0 ? (
                <p className="mb-0">No hay reservas agendadas para este día.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
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
                          <td>{reserva.categoriaId?.nombre}</td>
                          <td>{reserva.nombreMascota}</td>
                          <td className="text-capitalize">{reserva.estado}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default AgendaModal
