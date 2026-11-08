import Hero from "./Hero";
import Services from "./Services";
import Professionals from "./Professionals";

// Página de inicio (pública): presentación, servicios y profesionales.
// Los modales de login, registro y mis datos se abren encima de esta página
const Inicio = ({ estaLogueado }) => {
    return (
        <>
            <Hero estaLogueado={estaLogueado} />
            <Services />
            <Professionals />
        </>
    );
};

export default Inicio;
