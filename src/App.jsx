import { useState } from 'react';
import Header from './componentes/Header';
import Hero from './componentes/Hero';
import LoginModal from './componentes/LoginModal';
import Professionals from './componentes/Professionals';
import Services from './componentes/Services';


function App({modalActivo}) {
  const [estaLogueado, setEstaLogueado] = useState(
    window.localStorage.getItem("token") ? true : false
  )

   const loginCorrecto = () => {
    setEstaLogueado(true);
  };

  const logoutCorrecto = () => {
    setEstaLogueado(false);
  };

  return (
    <>
      <Header estaLogueado={estaLogueado} onLogout={logoutCorrecto}/>
      {/* LoginModal se agrega aca para que el modal aparezca en la pantalla principal */}
      {modalActivo === "login" && <LoginModal onLogin={loginCorrecto}/> }

      <main>
        <Hero/>
        <Services/>
        <Professionals/>
      </main>
    </>
  )
}

export default App
