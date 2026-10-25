import principal from "../assets/principal.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="hero-section">
      <div className="container">
        <div className="row align-items-center hero-content">
          <div className="col-12 col-lg-6">
            <div className="hero-information">
              <h1 className="hero-title">
                Cuidamos la salud de tu mascota
              </h1>

              <p className="hero-description">
                Amor, cuidado y salud para tu compañero de vida.
                <br />
                Tu mascota merece lo mejor, y nosotros estamos aquí para
                dárselo.
              </p>

              <button className="hero-button" type="button">
                Reserva una cita
              </button>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="hero-image-container">
              <img
                className="hero-image"
                src={principal}
                alt="Un perro y un gato jugando en el jardín"
              />

              <p className="hero-image-caption">
                Atención veterinaria de confianza
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;