import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from '../services/authServices';

const LoginModal = ({onLogin}) => {
    const navigate = useNavigate();

    const [valores, setValores] = useState({
        identificador: "",
        password: "",
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const resultado = await loginApi({
                ...valores,
                identificador: valores.identificador.trim(),
            });
            const token = resultado.token;

            console.log("token", token);
            window.localStorage.setItem("token", token);

            //se guardan los datos del usuario que se muestran en el front
            const usuario = {
                name: resultado.user.name,
                username: resultado.user.username,
                email: resultado.user.email,
                plan: resultado.user.plan,
            };
            window.localStorage.setItem("usuario", JSON.stringify(usuario));
            onLogin(usuario);
            navigate("/#profesionales")
        } catch (error) {
            console.error(error.response?.data ?? error);
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
                >
                  Ingresar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    <div className="modal-backdrop fade show" onClick={cerrarModal}/>
  </>
  )
}

export default LoginModal
