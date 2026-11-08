import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = ({estaLogueado, esAdmin, onLogout}) => {
  const navigate = useNavigate();

  const handlerLogout = () => {
    window.localStorage.clear();
    onLogout()
    navigate("/");
  };

  return (
    <header className="site-header">
      <nav
        className="navbar navbar-expand-md"
        aria-label="Navegación principal"
      >
        <div className="container">
          <Link className="navbar-brand" to="/" aria-label="Ir al inicio">
            <img
              className="navbar-logo"
              src={logo}
              alt="Hüellas, Absolutely pet-friendly"
            />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menuPrincipal"
            aria-controls="menuPrincipal"
            aria-expanded="false"
            aria-label="Abrir o cerrar el menú"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            id="menuPrincipal"
            className="collapse navbar-collapse justify-content-end"
          >
            <ul className="navbar-nav align-items-lg-center">
              {/* one page: cada opción baja a su sección con el ancla */}
              <li className="nav-item">
                <a className="nav-link" href="/#servicios">
                  Servicios
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/#profesionales">
                  Profesionales
                </a>
              </li>

              {estaLogueado && !esAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/#reservas">
                    Reservas
                  </a>
                </li>
              )}
              {estaLogueado && !esAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/#mis-reservas">
                    Mis reservas
                  </a>
                </li>
              )}

              {estaLogueado && (
                <li className="nav-item">
                  {/* el admin ve la agenda del día en lugar de sus datos (mis datos es un modal con su ruta) */}
                  {esAdmin ? (
                    <a className="nav-link" href="/#agenda">
                      Agenda
                    </a>
                  ) : (
                    <NavLink className="nav-link" to="/mis-datos">
                      Mis datos
                    </NavLink>
                  )}
                </li>
              )}
              {estaLogueado && esAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/#informes">
                    Informes
                  </a>
                </li>
              )}
              {estaLogueado && esAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/#clientes">
                    Clientes
                  </a>
                </li>
              )}
              {estaLogueado && esAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/#categorias">
                    Categorías
                  </a>
                </li>
              )}
              {!estaLogueado ? (
                <>
                  <li className="nav-item">
                 <NavLink className="nav-link" to="/register">
                  Registro
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
                </>
                ): (
                  <li className="nav-item">
                  <button
                    className="nav-link"
                    type="button"
                    onClick={handlerLogout}
                  >
                    Logout
                  </button>
                </li>

                )}
              
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;