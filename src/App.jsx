import Header from './componentes/Header';
import Hero from './componentes/Hero';
import Professionals from './componentes/Professionals';
import Services from './componentes/Services';


function App() {
  return (
    <>
      <Header/> 

      <main>
        <Hero/>
        <Services/>
        <Professionals/>
      </main>




    {/* LO HECHO POR EL PROFESOR */}
      {/* <Menu></Menu>
      <Contenido></Contenido> */}
    </>


    // LO HECHO POR NOSOTROS COMO BASE
    // <>
    //   {/* <section id="center"></section>
    //  <div className="ticks"></div> */}
    // </>
  )
}

export default App
