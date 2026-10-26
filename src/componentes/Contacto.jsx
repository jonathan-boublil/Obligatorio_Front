const MapPinIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
};

const PhoneIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L9 10.9a16 16 0 0 0 4.1 4.1l1.4-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
};

const InstagramIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" />
    </svg>
  );
};

const FacebookIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v3H7v3h3v7h3v-7h3l1-3h-4v-3c0-.6.4-1 1-1Z" />
    </svg>
  );
};

const Contact = () => {
  return (
    <section id="contacto" className="contact-section">
      <div className="container">
        <div className="section-heading">
          <h2>Contáctanos</h2>

          <p>
            Estamos aquí para responder cualquier pregunta sobre el cuidado de
            su mascota.
          </p>
        </div>

        <div className="row g-5">
          <div className="col-12 col-md-6">
            <div className="contact-information">
              <div className="contact-item">
                <span className="contact-icon">
                  <MapPinIcon />
                </span>

                <div>
                  <h3>Nuestra Ubicación</h3>
                  <p>
                    Cuareim 1451, esquina Mercedes
                    <br />
                    Uruguay
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">
                  <PhoneIcon />
                </span>

                <div>
                  <h3>Teléfono</h3>
                  <p>
                    <a className="contact-link" href="tel:29021505">
                      2902 1505
                    </a>
                  </p>
                  <p className="contact-hours">
                    Lunes a Sábados: 9:00 AM - 6:00 PM
                    <br />
                    Domingos: Cerrados
                  </p>
                </div>
              </div>

              <div className="contact-social">
                <h3>Síguenos en nuestras redes</h3>

                <div className="contact-social-links">
                  <a className="contact-social-link" href="https://instagram.com" aria-label="Instagram">
                    <InstagramIcon />
                  </a>

                  <a className="contact-social-link" href="https://facebook.com" aria-label="Facebook">
                    <FacebookIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="contact-map">
              <div className="contact-map-content">
                <h3>Visitanos</h3>
                <p>Cuareim 1451, Montevideo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;