import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="site-header">
      <nav
        className="navbar navbar-expand-md"
        aria-label="Navegación principal"
      >
        <div className="container">
          <a className="navbar-brand" href="#inicio" aria-label="Ir al inicio">
            <img
              className="navbar-logo"
              src={logo}
              alt="Hüellas, Absolutely pet-friendly"
            />
          </a>

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
              <li className="nav-item">
                <a className="nav-link" href="#servicios">
                  Servicios
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#profesionales">
                  Profesionales
                </a>
              </li>

              <li className="nav-item">
                <button className="nav-link" type="button">
                  Reservas
                </button>
              </li>

              <li className="nav-item">
                <button className="nav-link" type="button">
                  Registro
                </button>
              </li>

              <li className="nav-item">
                <button className="nav-link" type="button">
                  Login
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;