// Funciones de fechas y horarios compartidas por la reserva, la edición y la agenda

export const horarios = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30",
];

// "HH:mm" a minutos desde las 00:00, para poder restar horas
const aMinutos = (hora) => {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
};

// misma regla que el back: un horario está ocupado si hay otra reserva ese día a menos de 30 minutos
export const estaOcupado = (horario, horasOcupadas) => {
    return horasOcupadas.some(
        (horaOcupada) => Math.abs(aMinutos(horaOcupada) - aMinutos(horario)) < 30
    );
};

// Fecha LOCAL YYYY-MM-DD (sin UTC)
export const formatearFecha = (fecha) => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
};

// el input date usa AAAA-MM-DD y el back espera DD-MM-AAAA
export const fechaParaBack = (fechaTexto) => {
    const [anio, mes, dia] = fechaTexto.split("-");
    return `${dia}-${mes}-${anio}`;
};

// el back devuelve la fecha en UTC (medianoche): se toma el día tal cual, sin correrlo por la zona horaria
export const fechaDelBack = (fechaIso) => {
    return fechaIso.slice(0, 10);
};

// true si el día y la hora de la reserva ya pasaron (hora local, igual que la arma el back)
export const reservaYaPaso = (fechaIso, hora) => {
    const fechaHora = new Date(`${fechaDelBack(fechaIso)}T${hora}:00`);
    return fechaHora.getTime() < Date.now();
};

export const esDomingo = (fechaTexto) => {
    const fecha = new Date(`${fechaTexto}T00:00:00`);
    return fecha.getDay() === 0;
};

// Próximos 15 días desde mañana, sin domingos
export const obtenerFechasDisponibles = () => {
    const fechas = [];
    const hoy = new Date();
    let offset = 1;

    while (fechas.length < 15 && offset < 90) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + offset);
        const fechaTexto = formatearFecha(fecha);
        if (!esDomingo(fechaTexto)) fechas.push(fechaTexto);
        offset++;
    }
    return fechas;
};

// valida la fecha elegida, devuelve el mensaje de error o "" si está bien
export const validarFecha = (fecha, fechaMinima, fechaMaxima) => {
    if (fecha && esDomingo(fecha)) {
        return "Los domingos está cerrado. Elija otro día.";
    }
    if (fecha && (fecha < fechaMinima || fecha > fechaMaxima)) {
        return "La fecha está fuera del rango permitido.";
    }
    return "";
};
