import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const formularioCompleto = 
      valores.name !=="" &&
      valores.username !=="" &&
      valores.email !=="" &&
      valores.password !=="" &&
      valores.confirmPassword !=="";

  const formularioValido = 
    formularioCompleto && 
    valores.password === valores.confirmPassword;

   const onSubmit = async (event) => {
        event.preventDefault();

        setMensajeError("");

        try {
            const resultado = await registerApi(valores);
            const token = resultado.token;

            window.localStorage.setItem("token", token);

            onLogin();

            navigate("/#profesionales");
        } catch (error) {
            console.error(error);

            const respuesta = error.response?.data;

            if (respuesta?.errors?.length > 0) {
                const mensajes = respuesta.errors
                    .map((error) => error.message)
                    .join(". ");

                setMensajeError(mensajes);
            } else {
                setMensajeError(
                    respuesta?.message || "No se pudo completar el registro.",
                );
            };
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

              <form>
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
                  onClick={onSubmit}
                  disabled={!formularioValido}
                >
                  Registrarme
                </button>
              </form>
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
