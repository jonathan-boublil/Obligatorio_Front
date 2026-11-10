import { useState } from "react";
import { cambiarPlanApi } from "../services/userServices";
import { obtenerMensajeError } from "../services/mensajeError";

const CambiarPlan = ({
  onPlanCambiado,
  onCancelar,
}) => {
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] =
    useState("");

  const aceptarCambioPlan = async () => {
    setMensajeError("");
    setCargando(true);

    try {
      const usuarioActualizado =
        await cambiarPlanApi("premium");

      onPlanCambiado(usuarioActualizado);
    } catch (error) {
      console.error(error);

      setMensajeError(
        obtenerMensajeError(
          error,
          "No se pudo cambiar el plan.",
        ),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {mensajeError && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {mensajeError}
        </div>
      )}

      <p>
        ¿Querés cambiar tu plan de Plus a Premium?
      </p>

      <p className="text-secondary">
        El plan Premium no tiene límite anual de
        reservas.
      </p>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-outline-secondary"
          type="button"
          disabled={cargando}
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          className="btn btn-success"
          type="button"
          disabled={cargando}
          onClick={aceptarCambioPlan}
        >
          {cargando
            ? "Cambiando..."
            : "Pasar a Premium"}
        </button>
      </div>
    </>
  );
};

export default CambiarPlan;