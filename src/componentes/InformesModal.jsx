import React from "react";
import { useNavigate } from "react-router-dom";

const InformesModal = () => {
  const navigate = useNavigate();

  const cerrarModal = () => {
    navigate("/");
  };

  return (
    <>
      <div
        id="informesModal"
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="informesModalTitle"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="informesModalTitle"
                className="modal-title fs-4"
              >
                Informes
              </h2>

              <button
                className="btn-close"
                type="button"
                aria-label="Cerrar"
                onClick={cerrarModal}
              />
            </div>

            <div className="modal-body">
              {/* TODO: definir los filtros y las gráficas */}
              <p className="mb-0">Próximamente: gráficas con opciones de filtrado.</p>
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default InformesModal
