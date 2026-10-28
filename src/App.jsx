import { useState } from 'react';
import Header from './componentes/Header';
import Hero from './componentes/Hero';
import LoginModal from './componentes/LoginModal';
import MisDatosModal from './componentes/MisDatosModal';
import Professionals from './componentes/Professionals';
import Services from './componentes/Services';
import Contacto from './componentes/Contacto';
import Reserva from './componentes/Reserva';


function App({ modalActivo }) {
  const [estaLogueado, setEstaLogueado] = useState(
    window.localStorage.getItem("token") ? true : false
  )

  const [usuario, setUsuario] = useState(
    JSON.parse(window.localStorage.getItem("usuario"))
  )

  const loginCorrecto = (usuarioLogueado) => {
    setEstaLogueado(true);
    setUsuario(usuarioLogueado);
  };

  const logoutCorrecto = () => {
    setEstaLogueado(false);
    setUsuario(null);
  };

  const actualizarUsuario = (usuarioActualizado) => {
    window.localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  };

  return (
    <>
      <Header estaLogueado={estaLogueado} onLogout={logoutCorrecto} />
      {/* LoginModal se agrega aca para que el modal aparezca en la pantalla principal */}
      {modalActivo === "login" && <LoginModal onLogin={loginCorrecto} />}
      {modalActivo === "misDatos" && usuario && <MisDatosModal usuario={usuario} onActualizarUsuario={actualizarUsuario} />}

      <main>
        <Hero />
        <Services />
        <Professionals />
        {estaLogueado && <Reserva usuario={usuario} />}
        <Contacto />
      </main>
    </>
  )
}

export default App
