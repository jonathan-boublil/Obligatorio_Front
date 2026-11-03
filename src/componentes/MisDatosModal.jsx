import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMensajeError } from "../services/mensajeError";
import { cambiarPlanApi } from "../services/userServices";

// las reservas del usuario se muestran en la sección MisReservas, acá quedan los datos y el plan
const MisDatosModal = ({ usuario, onActualizarUsuario }) => {
  const navigate = useNavigate();

  // "datos" | "confirmarPlan"
  const [vista, setVista] = useState("datos");
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const esPremium = usuario.plan?.toLowerCase() === "premium";
  // el botón siempre ofrece pasarse al otro plan
  const planDestino = esPremium ? "plus" : "premium";

  const cerrarModal = () => {
    navigate("/");
  };

  //al cambiar de vista se limpia el error de la vista anterior
  const irAVista = (nuevaVista) => {
    setMensajeError("");
    setVista(nuevaVista);
  };

  const volverADatos = () => {
    irAVista("datos");
  };

  const aceptarCambioPlan = async () => {
    setMensajeError("");
    setCargando(true);
    try {
      const usuarioActualizado = await cambiarPlanApi(planDestino);
      onActualizarUsuario({ ...usuario, plan: usuarioActualizado.plan });
      setVista("datos");
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo cambiar el plan."));
    } finally {
      setCargando(false);
    }
  };

  const titulos = {
    datos: "Mis datos",
    confirmarPlan: "Cambiar plan",
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
              {mensajeError && (
                <div className="alert alert-danger" role="alert">
                  {mensajeError}
                </div>
              )}

              {/* Datos del usuario */}
              {vista === "datos" && (
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
                      onClick={() => irAVista("confirmarPlan")}
                    >
                      Pasar a {planDestino}
                    </button>
                  </dd>
                </dl>
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
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default MisDatosModal
