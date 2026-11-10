# Aplicación Web de Gestión Veterinaria

Aplicación frontend desarrollada para facilitar la gestión de una veterinaria. Permite que los clientes consulten la información del centro, creen una cuenta, creen y administren sus reservas, mientras que los administradores pueden gestionar la agenda, los clientes, los servicios y los informes del sistema.

## Aplicación desplegada

La aplicación se encuentra publicada en Vercel:

[Ingresar a la aplicación](https://obligatorio-front.vercel.app/)

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Navegación por la información pública de la veterinaria, sus servicios y profesionales.
- Creación de reservas mediante la selección de un servicio, una fecha y un horario disponible.
- Registro de los datos de la mascota, el motivo de la consulta y una imagen opcional.
- Consulta, búsqueda, edición, reprogramación y eliminación de reservas.
- Generación de un código QR para presentar los datos de una reserva.
- Consulta y modificación de los datos personales del usuario.
- Gestión de planes y visualización de su uso.
- Interfaz adaptada según el rol del usuario.

## Usuarios y planes

Los usuarios pueden registrarse desde la aplicación con su nombre, nombre de usuario, correo electrónico y contraseña. Las cuentas nuevas reciben el rol de cliente y el plan `Plus`.

- **Plan Plus:** permite realizar hasta 4 reservas por año calendario.
- **Plan Premium:** no tiene límite anual de reservas. El usuario puede cambiar a este plan desde la sección **Mis datos**.

Cada cliente puede:

- Crear reservas en fechas y horarios disponibles.
- Ver los detalles de sus reservas y filtrarlas por mascota.
- Reprogramar, editar o eliminar una reserva.
- Adjuntar o actualizar una imagen de su mascota.
- Consultar el código QR asociado a una reserva.
- Editar sus datos personales o eliminar su cuenta cuando no tenga reservas asociadas.

## Acceso de administrador

Para probar las funcionalidades administrativas se puede iniciar sesión con las siguientes credenciales:

- **Nombre de usuario:** `admin`
- **Contraseña:** `admin`

El administrador puede:

- Consultar la agenda de reservas de cualquier día y ver el detalle completo de cada cita.
- Listar, buscar, editar y eliminar clientes.
- Crear, editar y eliminar las categorías de servicios disponibles para reservar.
- Consultar un informe gráfico con la cantidad de reservas por categoría.
- Filtrar el informe seleccionando uno o más clientes.

## Reservas e integraciones

Los horarios ocupados se consultan antes de confirmar o reprogramar una reserva. El backend valida nuevamente la disponibilidad para evitar reservas duplicadas.

El proyecto también utiliza funcionalidades proporcionadas por el backend:

- Autenticación mediante tokens.
- Almacenamiento de imágenes de mascotas en Cloudinary.
- Mejora automática del motivo de consulta mediante Gemini, generando un texto profesional para el personal veterinario.
- Generación de códigos QR con la información de las reservas.

## Conexión con el backend

El frontend consume la API desplegada en:

[`https://obligatorio-full-stack-pearl.vercel.app/api/v1`](https://obligatorio-full-stack-pearl.vercel.app/api/v1)

La documentación de sus endpoints está disponible en Postman:

[Ver documentación de la API](https://documenter.getpostman.com/view/55527769/2sBYB4M7gw)

## Tecnologías utilizadas

- React.
- Vite.
- Redux Toolkit y React Redux.
- React Router.
- Axios.
- Bootstrap.
- Chart.js y React Chart.js 2.

## Ejecución local

Luego de clonar el repositorio, instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto con la dirección del backend:

```env
VITE_API_URL_BACKEND=https://obligatorio-full-stack-pearl.vercel.app/api/v1
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```
