import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Grafica = ({
   etiquetas,
   datos,
   nombreGrafica,
   nombreDatos, 
}) => {
    const estilos = getComputedStyle(
        document.documentElement,
    );

    const obtenerColor = (variable) => {
        return estilos.getPropertyValue(variable);
    };

    const colores = [
        obtenerColor("--chart-color-1"),
        obtenerColor("--chart-color-2"),
        obtenerColor("--chart-color-3"),
        obtenerColor("--chart-color-4"),
        obtenerColor("--chart-color-5"),
    ];

    const colorTitulo = obtenerColor("--color-heading");
    const colorTexto = obtenerColor("--color-text");
    const colorGrilla = obtenerColor("--color-border");

   const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          color: colorTexto,
        },
      },

      title: {
        display: true,
        text: nombreGrafica || "Gráfica",
        color: colorTitulo,

        font: {
          size: 18,
          weight: "bold",
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: colorTexto,
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: colorGrilla,
        },

        ticks: {
          color: colorTexto,
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  const data = {
    labels: etiquetas,
    datasets: [
      {
        label: nombreDatos || "Datos",
        data: datos,
        backgroundColor: etiquetas.map(
          (_, indice) => colores[indice % colores.length],
        ),
        borderRadius: 8,
        maxBarThickness: 70,
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

export default Grafica
