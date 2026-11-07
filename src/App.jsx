import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Header from './componentes/Header';
import Hero from './componentes/Hero';
import LoginModal from './componentes/LoginModal';
import MisDatosModal from './componentes/MisDatosModal';
import Categorias from './componentes/Categorias';
import Agenda from './componentes/Agenda';
import Informes from './componentes/Informes';
import Clientes from './componentes/Clientes';
import MisReservas from './componentes/MisReservas';
import Professionals from './componentes/Professionals';
import Services from './componentes/Services';
import Contacto from './componentes/Contacto';
import Reserva from './componentes/Reserva';
import { RegisterModal } from "./componentes/RegisterModal";
import { limpiarReservasSlice } from './redux/features/reservasSlice';

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

  const [contadorReservas, setContadorReservas] = useState(0);
  const reservaCreada = () => setContadorReservas((c) => c + 1);

  const loginCorrecto = (usuarioLogueado) => {
    setEstaLogueado(true);
    setUsuario(usuarioLogueado);
  };

  const logoutCorrecto = () => {
    dispatch(limpiarReservasSlice());
    setEstaLogueado(false);
    setUsuario(null);
  };

  const actualizarUsuario = (usuarioActualizado) => {
    window.localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  };

  return (
    <>
      <Header estaLogueado={estaLogueado} esAdmin={esAdmin} onLogout={logoutCorrecto} />
      {/* LoginModal se agrega aca para que el modal aparezca en la pantalla principal */}
      {modalActivo === "login" && <LoginModal onLogin={loginCorrecto} />}
      {modalActivo === "registro" && <RegisterModal onLogin={loginCorrecto} />}
      {modalActivo === "misDatos" && usuario && !esAdmin && <MisDatosModal usuario={usuario} onActualizarUsuario={actualizarUsuario} />}

      <main>
        <Hero estaLogueado={estaLogueado} />
        <Services />
        <Professionals />
        {estaLogueado && !esAdmin && <Reserva usuario={usuario} onReservaCreada={reservaCreada} />}
        {estaLogueado && !esAdmin && <MisReservas actualizar={contadorReservas} />}
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
