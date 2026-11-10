import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMensajeError } from "../services/mensajeError";
import { loginApi } from '../services/authServices';

const LoginModal = ({onLogin}) => {
    const navigate = useNavigate();

    const [valores, setValores] = useState({
        identificador: "",
        password: "",
    });

    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const formularioCompleto = 
      valores.identificador !=="" &&
      valores.password !==""; 


    const onSubmit = async (e) => {
        e.preventDefault();
        setMensajeError("");
        setMensajeExito("");

        //se valida antes de llamar al back (los intentos fallidos cuentan para el límite de login)
        const errores = [];
        if (valores.identificador.trim() === "") {
            errores.push("El usuario no puede estar vacío");
        }
        if (valores.password === "") {
            errores.push("La contraseña no puede estar vacía");
        }
        if (errores.length > 0) {
            setMensajeError(errores.join(". "));
            return;
        }

        try {
            const resultado = await loginApi({
                ...valores,
                identificador: valores.identificador.trim(),
            });
            const token = resultado.token;

            window.localStorage.setItem("token", token);

            //se guardan los datos del usuario que se muestran en el front
            const usuario = {
                name: resultado.user.name,
                username: resultado.user.username,
                email: resultado.user.email,
                plan: resultado.user.plan,
                role: resultado.user.role,
            };
            window.localStorage.setItem("usuario", JSON.stringify(usuario));
            onLogin(usuario);
            setMensajeExito(
              "Inicio de sesión correcto. Redirigiendo...",
            );
            setTimeout(() => {
              navigate("/");
            }, 1500);
        } catch (error) {
            console.error(error);
            setMensajeError(obtenerMensajeError(error, "No se pudo iniciar sesión."));
        }
    };

    const handleChange = (e) => {
        const auxValores = { ...valores };
        const name = e.target.name;
        const value = e.target.value;
        auxValores[name] = value; //se usa para saber quien ejecuto el evento
        setValores(auxValores);
    };

    const cerrarModal = () => {
      navigate("/");
    };

  return (
    <>
      <div
        id="loginModal"
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="loginModalTitle"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="loginModalTitle"
                className="modal-title fs-4"
              >
                Iniciar sesión
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

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="loginIdentifier"
                  >
                    Usuario o correo electrónico
                  </label>

                  <input
                    id="loginIdentifier"
                    className="form-control"
                    type="text"
                    name="identificador"
                    value={valores.identificador}
                    placeholder="Ingresá tu usuario o correo"
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="loginPassword"
                  >
                    Contraseña
                  </label>

                  <input
                    id="loginPassword"
                    className="form-control"
                    type="password"
                    name="password"
                    value={valores.password}
                    placeholder="Ingresá tu contraseña"
                    onChange={handleChange}
                  />
                </div>

                <button
                  className="btn btn-success"
                  type="submit"
                  disabled={!formularioCompleto}
                >
                  Ingresar
                </button>
              </form>
              
              {mensajeExito && (
                <>
                  <br />
                  <div className="alert alert-success" role="alert">
                    {mensajeExito}
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

export default LoginModal
