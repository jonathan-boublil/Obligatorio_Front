import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMensajeError } from "../services/mensajeError";
import { cambiarPlanApi, obtenerUsuarioApi, editarUsuarioApi, eliminarCuentaApi } from "../services/userServices";

const datosVacios = {
  name: "",
  username: "",
  email: "",
};

// mismas reglas que el back (update-user-body.schema), devuelve la lista de errores
const validarDatos = (valores) => {
  const errores = [];
  const nombre = valores.name.trim();

  if (nombre.length < 3 || nombre.length > 30) {
    errores.push("El nombre debe tener entre 3 y 30 caracteres");
  }
  if (!/^[a-zA-Z0-9]{3,}$/.test(valores.username.trim())) {
    errores.push("El usuario debe tener al menos 3 caracteres, solo letras y números");
  }
  if (!/^\S+@\S+\.\S+$/.test(valores.email.trim())) {
    errores.push("El email no tiene un formato válido");
  }
  return errores;
};

// las reservas del usuario se muestran en la sección MisReservas, acá quedan los datos y el plan
const MisDatosModal = ({ usuario, onActualizarUsuario, onLogout }) => {
  const navigate = useNavigate();

  // "datos" | "confirmarPlan" | "editar" | "eliminarCuenta"
  const [vista, setVista] = useState("datos");
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [valoresEdicion, setValoresEdicion] = useState(datosVacios);

  //al abrir el modal se piden los datos actuales al back, por si cambiaron desde el login
  useEffect(() => {
    const controller = new AbortController();

    const obtenerUsuario = async () => {
      try {
        const usuarioBack = await obtenerUsuarioApi(controller.signal);
        //se guardan los mismos campos que guarda el login
        onActualizarUsuario({
          name: usuarioBack.name,
          username: usuarioBack.username,
          email: usuarioBack.email,
          plan: usuarioBack.plan,
          role: usuarioBack.role,
        });
      } catch (error) {
        //si se canceló porque el modal se cerró, no es un error a mostrar
        if (error.code === "ERR_CANCELED") {
          return;
        }
        console.error(error);
        setMensajeError(obtenerMensajeError(error, "No se pudieron actualizar tus datos."));
      }
    };

    obtenerUsuario();
    return () => {
      controller.abort();
    };
    //solo al abrir: onActualizarUsuario cambia en cada render de App y volvería a pedir los datos en loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  //el formulario arranca con los datos actuales del usuario
  const empezarEdicion = () => {
    setValoresEdicion({
      name: usuario.name,
      username: usuario.username,
      email: usuario.email,
    });
    irAVista("editar");
  };

  const handleChange = (e) => {
    const auxValores = { ...valoresEdicion };
    auxValores[e.target.name] = e.target.value;
    setValoresEdicion(auxValores);
  };

  //solo se mandan los campos que cambiaron (el back pide al menos uno)
  const camposCambiados = {};
  for (const campo of Object.keys(datosVacios)) {
    const valor = valoresEdicion[campo].trim();
    if (valor !== usuario[campo]) {
      camposCambiados[campo] = valor;
    }
  }
  const hayCambios = Object.keys(camposCambiados).length > 0;

  const guardarDatos = async () => {
    const errores = validarDatos(valoresEdicion);
    if (errores.length > 0) {
      setMensajeError(errores.join(". "));
      return;
    }

    setMensajeError("");
    setCargando(true);
    try {
      const usuarioActualizado = await editarUsuarioApi(camposCambiados);
      onActualizarUsuario({
        ...usuario,
        name: usuarioActualizado.name,
        username: usuarioActualizado.username,
        email: usuarioActualizado.email,
      });
      setVista("datos");
    } catch (error) {
      //si falla sigue en el formulario para poder corregir
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudieron guardar los cambios."));
    } finally {
      setCargando(false);
    }
  };

  //si el back lo permite (sin reservas) se borra la cuenta y se cierra la sesión
  const eliminarCuenta = async () => {
    setMensajeError("");
    setCargando(true);
    try {
      await eliminarCuentaApi();
      window.localStorage.clear();
      onLogout();
      navigate("/");
    } catch (error) {
      console.error(error);
      setMensajeError(obtenerMensajeError(error, "No se pudo eliminar la cuenta."));
      setCargando(false);
    }
  };

  const titulos = {
    datos: "Mis datos",
    confirmarPlan: "Cambiar plan",
    editar: "Editar mis datos",
    eliminarCuenta: "Eliminar cuenta",
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

              {vista === "datos" && (
                <div className="d-flex justify-content-between gap-2 mt-4">
                  <button
                    className="btn btn-outline-success"
                    type="button"
                    onClick={empezarEdicion}
                  >
                    Editar mis datos
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={() => irAVista("eliminarCuenta")}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              )}

              {/* Edición de nombre, usuario y email (el plan se cambia aparte) */}
              {vista === "editar" && (
                <form onSubmit={(e) => { e.preventDefault(); guardarDatos(); }}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="misDatosNombre">Nombre</label>
                    <input
                      id="misDatosNombre"
                      className="form-control"
                      type="text"
                      name="name"
                      maxLength="30"
                      value={valoresEdicion.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="misDatosUsuario">Usuario</label>
                    <input
                      id="misDatosUsuario"
                      className="form-control"
                      type="text"
                      name="username"
                      value={valoresEdicion.username}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="misDatosEmail">Email</label>
                    <input
                      id="misDatosEmail"
                      className="form-control"
                      type="email"
                      name="email"
                      value={valoresEdicion.email}
                      onChange={handleChange}
                    />
                  </div>

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
                      type="submit"
                      disabled={cargando || !hayCambios}
                    >
                      {cargando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              )}

              {/* Confirmación para eliminar la cuenta */}
              {vista === "eliminarCuenta" && (
                <>
                  <p>
                    ¿Seguro que quiere eliminar su cuenta? Esta acción no se puede deshacer.
                    Si tiene reservas, primero tiene que cancelarlas.
                  </p>

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
                      className="btn btn-danger"
                      type="button"
                      disabled={cargando}
                      onClick={eliminarCuenta}
                    >
                      {cargando ? "Eliminando..." : "Eliminar cuenta"}
                    </button>
                  </div>
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
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default MisDatosModal
