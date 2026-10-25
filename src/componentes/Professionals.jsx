import veterinarianOne from "../assets/vet1.jpg";
import veterinarianTwo from "../assets/vet2.jpg";
import veterinarianThree from "../assets/vet3.jpg";

const professionals = [
  {
    id: 1,
    name: "Dra. María García",
    specialty: "Veterinaria",
    image: veterinarianOne,
    imageDescription:
      "Dra. María García junto a un perro",
  },
  {
    id: 2,
    name: "Dr. Carlos López",
    specialty: "Veterinario",
    image: veterinarianTwo,
    imageDescription:
      "Dr. Carlos López sosteniendo un perro",
  },
  {
    id: 3,
    name: "Dra. Ana Rodríguez",
    specialty: "Veterinaria",
    image: veterinarianThree,
    imageDescription:
      "Dra. Ana Rodríguez sosteniendo un perro",
  },
];

const Professionals = () => {
  return (
    <section id="profesionales" className="professionals-section">
      <div className="container">
        <div className="section-heading">
          <h2>Conozca nuestro equipo</h2>

          <p>
            Profesionales experimentados dedicados al cuidado de tu mascota
          </p>
        </div>

        <h3 className="professionals-subtitle">Veterinarios</h3>

        <div className="row g-4">
          {professionals.map((professional) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={professional.id}
            >
              <article className="professional-card">
                <img
                  className="professional-image"
                  src={professional.image}
                  alt={professional.imageDescription}
                />

                <div className="professional-information">
                  <h4>{professional.name}</h4>
                  <p>{professional.specialty}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Professionals;