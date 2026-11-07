import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerMensajeError } from '../services/mensajeError';
import { registerApi } from '../services/authServices';

export const RegisterModal = ({onLogin}) => {
    const navigate = useNavigate();

    const [valores, setValores] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

   const [mensajeError, setMensajeError] = useState("");
   const [mensajeExito, setMensajeExito] = useState("");

   const nombreValido =
    valores.name.trim().length >= 3 &&
    valores.name.trim().length <= 30;

    const usuarioValido =
      valores.username.length >= 3 &&
      /^[a-zA-Z0-9]+$/.test(valores.username);

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        valores.email,
      );

    const passwordValida =
      valores.password.length >= 3 &&
      valores.password.length <= 30;

    const confirmacionValida =
      valores.confirmPassword !== "" &&
      valores.password === valores.confirmPassword;

  const formularioValido = 
      nombreValido &&
      usuarioValido &&
      emailValido &&
      passwordValida &&
      confirmacionValida;

   const onSubmit = async (event) => {
        event.preventDefault();

        setMensajeError("");
        setMensajeExito("");

        try {
            const resultado = await registerApi(valores);
            const token = resultado.token;

            window.localStorage.setItem("token", token);

            //se guardan los datos del usuario igual que en el login
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
            setMensajeError(obtenerMensajeError(error, "No se pudo completar el registro."));
        };
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
        id="registerModal"
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registerModalTitle"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="registerModalTitle"
                className="modal-title fs-4"
              >
                Crear cuenta
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
                    htmlFor="registerName"
                  >
                    Nombre
                  </label>

                  <input
                    id="registerName"
                    className="form-control"
                    type="text"
                    name="name"
                    value={valores.name}
                    placeholder="Ingresá tu nombre"
                    minLength="3"
                    maxLength="30"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="registerUsername"
                  >
                    Nombre de usuario
                  </label>

                  <input
                    id="registerUsername"
                    className="form-control"
                    type="text"
                    name="username"
                    value={valores.username}
                    placeholder="Elegí un nombre de usuario"
                    minLength="3"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="registerEmail"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="registerEmail"
                    className="form-control"
                    type="email"
                    name="email"
                    value={valores.email}
                    placeholder="Ingresá tu correo"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="registerPassword"
                  >
                    Contraseña
                  </label>

                  <input
                    id="registerPassword"
                    className="form-control"
                    type="password"
                    name="password"
                    value={valores.password}
                    placeholder="Ingresá una contraseña"
                    minLength="3"
                    maxLength="30"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="registerConfirmPassword"
                  >
                    Confirmar contraseña
                  </label>

                  <input
                    id="registerConfirmPassword"
                    className="form-control"
                    type="password"
                    name="confirmPassword"
                    value={valores.confirmPassword}
                    placeholder="Repetí la contraseña"
                    minLength="3"
                    maxLength="30"
                    required
                    onChange={handleChange}
                  />
                </div>

                <button
                  className="btn btn-success"
                  type="submit"
                  disabled={!formularioValido}
                >
                  Registrarme
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

      <div
        className="modal-backdrop fade show"
        onClick={cerrarModal}
      />
    </>
  )
}
