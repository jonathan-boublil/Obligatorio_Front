import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Header from './componentes/Header';
import Inicio from './componentes/Inicio';
import RutaProtegida from './componentes/RutaProtegida';
import LoginModal from './componentes/LoginModal';
import MisDatosModal from './componentes/MisDatosModal';
import Categorias from './componentes/Categorias';
import Agenda from './componentes/Agenda';
import Informes from './componentes/Informes';
import Clientes from './componentes/Clientes';
import MisReservas from './componentes/MisReservas';
import Contacto from './componentes/Contacto';
import Reserva from './componentes/Reserva';
import { RegisterModal } from "./componentes/RegisterModal";
import { limpiarReservasSlice } from './redux/features/reservasSlice';

// One page: todas las secciones están en la misma página y se muestran según el rol.
// "modalActivo" viene de la ruta (Rutas.jsx) y abre un modal encima de la página
// si hay token es true
function App({ modalActivo }) {
  const dispatch = useDispatch();
  const [estaLogueado, setEstaLogueado] = useState(
    window.localStorage.getItem("token") ? true : false
  )

  const [usuario, setUsuario] = useState(
    JSON.parse(window.localStorage.getItem("usuario"))
  )

  const esAdmin = usuario?.role === "admin";
  const esCliente = estaLogueado && !esAdmin;

  const loginCorrecto = (usuarioLogueado) => {
    setEstaLogueado(true);
    setUsuario(usuarioLogueado);
  };

  const logoutCorrecto = () => {
    setEstaLogueado(false);
    setUsuario(null);
    //se vacían las reservas del usuario que salió para que no se mezclen con las del próximo que entre
    dispatch(limpiarReservasSlice());
  };

  const actualizarUsuario = (usuarioActualizado) => {
    window.localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  };

  return (
    <>
      <Header estaLogueado={estaLogueado} esAdmin={esAdmin} onLogout={logoutCorrecto} />
      {/* los modales se abren encima de la página */}
      {modalActivo === "login" && <LoginModal onLogin={loginCorrecto} />}
      {modalActivo === "registro" && <RegisterModal onLogin={loginCorrecto} />}
      {/* /mis-datos es solo para clientes logueados: sin sesión manda al login y al admin al inicio */}
      {modalActivo === "misDatos" && (
        <RutaProtegida estaLogueado={estaLogueado} permitido={Boolean(usuario) && !esAdmin}>
          <MisDatosModal usuario={usuario} onActualizarUsuario={actualizarUsuario} onLogout={logoutCorrecto} />
        </RutaProtegida>
      )}

      <main>
        <Inicio estaLogueado={estaLogueado} />
        {esCliente && <Reserva usuario={usuario} />}
        {esCliente && <MisReservas />}
        {esAdmin && <Clientes />}
        {esAdmin && <Categorias />}
        {esAdmin && <Agenda />}
        {esAdmin && <Informes />}
        <Contacto />
      </main>
    </>
  )
}

export default App
