import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { cerrarErrorSlice } from "../redux/features/errorSlice";

const ErrorModal = () => {
  const dispatch = useDispatch();
  const mensaje = useSelector((state) => state.errorSlice);

  if (!mensaje) return null;

  const cerrarModal = () => {
    dispatch(cerrarErrorSlice());
  };

  return (
    <>
      {/* z-index más alto para que quede arriba de los otros modales */}
      <div
        id="errorModal"
        className="modal fade show d-block"
        style={{ zIndex: 1070 }}
        tabIndex="-1"
        role="alertdialog"
        aria-labelledby="errorModalTitle"
        aria-describedby="errorModalMensaje"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="errorModalTitle"
                className="modal-title fs-5 text-danger"
              >
                Error
              </h2>
            </div>

            <div className="modal-body">
              <p id="errorModalMensaje" className="mb-0" style={{ whiteSpace: "pre-line" }}>
                {mensaje}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-success"
                type="button"
                onClick={cerrarModal}
                autoFocus
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" style={{ zIndex: 1065 }} />
  </>
  )
}

export default ErrorModal
