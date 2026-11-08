import { Navigate } from "react-router-dom";

// Deja ver una página solo si hay sesión y el rol tiene permiso:
// sin sesión manda al login y con sesión pero sin permiso (ej: un admin en /reservas) manda al inicio
const RutaProtegida = ({ estaLogueado, permitido, children }) => {
    if (!estaLogueado) {
        return <Navigate to="/login" replace />;
    }
    if (!permitido) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default RutaProtegida;
