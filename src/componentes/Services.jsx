const HeartIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
};

const ScissorsIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="7" r="3" />
      <circle cx="6" cy="17" r="3" />
      <path d="m8.7 8.3 10.8 6.2" />
      <path d="m8.7 15.7 10.8-6.2" />
    </svg>
  );
};

const DropIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.7S6 9.2 6 14a6 6 0 0 0 12 0c0-4.8-6-11.3-6-11.3Z" />
    </svg>
  );
};

const services = [
  {
    id: 1,
    title: "Veterinaria clínica",
    description:
      "Atendemos la salud de tus mascotas con consultas, controles, vacunación, desparasitación y urgencias. Nuestro equipo profesional asegura diagnóstico y cuidado confiable en cada visita.",
    icon: <HeartIcon />,
  },
  {
    id: 2,
    title: "Baño",
    description:
      "Ofrecemos servicios de higiene esencial para tu mascota incluido limpieza de oídos. Garantizamos comodidad y bienestar en cada sesión, con atención profesional y segura.",
    icon: <ScissorsIcon />,
  },
  {
    id: 3,
    title: "Corte de pelo y estilismo",
    description:
      "Ofrecemos cortes de pelo y estilismo profesional para mascotas, adaptados a cada raza y necesidad. Garantizamos comodidad, higiene y una apariencia cuidada, siempre con atención especializada.",
    icon: <DropIcon />,
  },
];

const Services = () => {
  return (
    <section id="servicios" className="services-section">
      <div className="container">
        <div className="section-heading">
          <h2>Nuestros Servicios</h2>

          <p>Todo lo que tu mascota necesita para una vida sana y feliz</p>
        </div>

        <div className="row g-4 justify-content-center">
          {services.map((service) => (
            <div className="col-12 col-md-6" key={service.id}>
              <article className="service-card">
                <div className="service-icon">{service.icon}</div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;