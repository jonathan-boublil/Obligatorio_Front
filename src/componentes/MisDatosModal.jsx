import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarPlanApi, listarReservasApi } from "../services/userServices";

// la fecha viene en UTC desde el back, se muestra tal cual sin correrla por la zona horaria
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-UY", { timeZone: "UTC" });
};

const MisDatosModal = ({ usuario, onActualizarUsuario }) => {
  const navigate = useNavigate();

  // "datos" | "confirmarPlan" | "reservas"
  const [vista, setVista] = useState("datos");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [reservas, setReservas] = useState([]);

  const esPremium = usuario.plan?.toLowerCase() === "premium";
  // el botón siempre ofrece pasarse al otro plan
  const planDestino = esPremium ? "plus" : "premium";

  //cuando se entra a la vista de reservas se piden al back
  useEffect(() => {
    if (vista !== "reservas") return;

    const cargarReservas = async () => {
      setCargando(true);
      setError("");
      try {
        const lista = await listarReservasApi();
        setReservas(lista);
      } catch (error) {
        console.error(error.response?.data ?? error);
        setError("No se pudieron cargar las reservas.");
      } finally {
        setCargando(false);
      }
    };

    cargarReservas();
  }, [vista]);

  const cerrarModal = () => {
    navigate("/");
  };

  const volverADatos = () => {
    setError("");
    setVista("datos");
  };

  const aceptarCambioPlan = async () => {
    setCargando(true);
    setError("");
    try {
      const usuarioActualizado = await cambiarPlanApi(planDestino);
      onActualizarUsuario({ ...usuario, plan: usuarioActualizado.plan });
      setVista("datos");
    } catch (error) {
      console.error(error.response?.data ?? error);
      setError("No se pudo cambiar el plan. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const titulos = {
    datos: "Mis datos",
    confirmarPlan: "Cambiar plan",
    reservas: "Mis reservas",
  };

  return (
    <>
      <div
        id="misDatosModal"
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="misDatosModalTitle"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="misDatosModalTitle"
                className="modal-title fs-4"
              >
                {titulos[vista]}
              </h2>

              <button
                className="btn-close"
                type="button"
                aria-label="Cerrar"
                onClick={cerrarModal}
              />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Datos del usuario */}
              {vista === "datos" && (
                <>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Nombre</dt>
                    <dd className="col-sm-8">{usuario.name}</dd>

                    <dt className="col-sm-4">Usuario</dt>
                    <dd className="col-sm-8">{usuario.username}</dd>

                    <dt className="col-sm-4">Email</dt>
                    <dd className="col-sm-8">{usuario.email}</dd>

                    <dt className="col-sm-4">Plan</dt>
                    <dd className="col-sm-8 d-flex align-items-center gap-2">
                      <span className="text-capitalize">{usuario.plan}</span>
                      <button
                        className="btn btn-outline-success btn-sm"
                        type="button"
                        onClick={() => setVista("confirmarPlan")}
                      >
                        Pasar a {planDestino}
                      </button>
                    </dd>
                  </dl>

                  <button
                    className="btn btn-success mt-3"
                    type="button"
                    onClick={() => setVista("reservas")}
                  >
                    Ver reservas
                  </button>
                </>
              )}

              {/* Confirmación de cambio de plan */}
              {vista === "confirmarPlan" && (
                <>
                  <p>¿Quiere pasarse a plan {planDestino}?</p>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      disabled={cargando}
                      onClick={volverADatos}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-success"
                      type="button"
                      disabled={cargando}
                      onClick={aceptarCambioPlan}
                    >
                      {cargando ? "Cambiando..." : "Aceptar"}
                    </button>
                  </div>
                </>
              )}

              {/* Historial de reservas */}
              {vista === "reservas" && (
                <>
                  {cargando && <p>Cargando reservas...</p>}

                  {!cargando && !error && reservas.length === 0 && (
                    <p>Todavía no tenés reservas.</p>
                  )}

                  {!cargando && reservas.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Servicio</th>
                            <th>Mascota</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservas.map((reserva) => (
                            <tr key={reserva.id}>
                              <td>{formatearFecha(reserva.fecha)}</td>
                              <td>{reserva.hora}</td>
                              <td>{reserva.categoriaId?.nombre}</td>
                              <td>{reserva.nombreMascota}</td>
                              <td className="text-capitalize">{reserva.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button
                    className="btn btn-outline-secondary mt-2"
                    type="button"
                    onClick={volverADatos}
                  >
                    Volver
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default MisDatosModal
