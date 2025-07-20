// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type { CreatePacienteFormValues } from "../types";

export const handlers = [
  http.get("http://localhost:3000/api/pacientes", () => {
    return HttpResponse.json(
      [
        {
          paciente_id: 3,
          nombre: "Juan",
          apellido: "Perez",
          fecha_nacimiento: "1990-01-15",
          genero: "Masculino",
          email: "juan.perez@example.com",
          fecha_registro: "2023-01-01T10:00:00Z",
          rut: "11.111.111-1",
        },
        {
          paciente_id: 4,
          nombre: "Maria",
          apellido: "Gonzalez",
          fecha_nacimiento: "1985-05-20",
          genero: "Femenino",
          email: "maria.gonzalez@example.com",
          fecha_registro: "2023-01-02T11:00:00Z",
          rut: "22.222.222-2",
        },
      ],
      { status: 200 }
    );
  }),

  http.post("http://localhost:3000/api/pacientes", async ({ request }) => {
    const newPatientData = (await request.json()) as CreatePacienteFormValues;
    return HttpResponse.json(
      {
        paciente_id: 5,
        ...newPatientData,
        fecha_registro: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get(
    "http://localhost:3000/api/contactos-emergencia/:id",
    ({ params }) => {
      const { patientId } = params;
      if (patientId === "1") {
        return HttpResponse.json(
          [
            {
              contacto_emergencia_id: 101,
              paciente_id: 1,
              nombre_contacto: "Ana Perez",
              telefono_contacto: "987654321",
              relacion_paciente: "Hermana",
              fecha_registro: "2023-01-05T12:00:00Z",
            },
          ],
          { status: 200 }
        );
      }
      return HttpResponse.json([], { status: 200 });
    }
  ),
];
