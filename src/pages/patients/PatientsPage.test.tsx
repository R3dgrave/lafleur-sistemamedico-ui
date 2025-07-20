import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "react-toastify";
import PatientDetailsPage from "./PatientDetailsPage";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
import { vi } from "vitest"; // 👈 Importar vi

import type { CreatePacienteFormValues } from "../../types/index";

// Mock de react-router-dom para controlar useParams y useNavigate
const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockUseNavigate,
  };
});

// Mock del componente EmergencyContactForm
vi.mock("@/components/patientsForms/EmergencyContactForm", () => {
  type MockPatientFormProps = {
    onSubmit: (data: any) => void;
    initialData?: any;
    isSubmitting?: boolean;
    onCancel: () => void;
  };
  return {
    default: ({
      onSubmit,
      initialData,
      isSubmitting,
      onCancel,
    }: MockPatientFormProps) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(initialData || {});
        }}
      >
        <input
          data-testid="emergency-contact-form-name"
          defaultValue={initialData?.nombre_contacto || ""}
        />
        <button type="submit" disabled={isSubmitting}>
          Submit Contact
        </button>
        <button type="button" onClick={onCancel}>
          Cancel Contact
        </button>
      </form>
    ),
  };
});

// Mock de react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PatientDetailsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockUseParams.mockReturnValue({ id: "1" });
    mockUseNavigate.mockClear();
    (toast.success as any).mockClear();
    (toast.error as any).mockClear();

    server.use(
      http.get("http://localhost:3000/api/pacientes/:id", ({ params }) => {
        if (params.id === "1") {
          return HttpResponse.json({
            paciente_id: 1,
            nombre: "Juan",
            apellido: "Perez",
            fecha_nacimiento: "1990-01-15",
            genero: "Masculino",
            email: "juan.perez@example.com",
            fecha_registro: "2023-01-01T10:00:00Z",
            rut: "11.111.111-1",
          });
        }
        return new HttpResponse(null, { status: 404 });
      }),
      http.get(
        "http://localhost:3000/api/contactos-emergencia/:id",
        ({ params }) => {
          if (params.patientId === "1") {
            return HttpResponse.json([
              {
                contacto_emergencia_id: 101,
                paciente_id: 1,
                nombre_contacto: "Ana Perez",
                telefono_contacto: "987654321",
                relacion_paciente: "Hermana",
                fecha_registro: "2023-01-05T12:00:00Z",
              },
            ]);
          }
          return HttpResponse.json([]);
        }
      )
    );
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/pacientes/1"]}>
          <Routes>
            <Route path="/pacientes/:id" element={ui} />
            <Route path="/pacientes" element={<div>Patients List Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  test("renders loading state initially", () => {
    server.use(
      http.get(
        "http://localhost:3000/api/pacientes/:id",
        () => new Promise(() => {})
      ),
      http.get(
        "http://localhost:3000/api/contactos-emergencia/:id",
        () => new Promise(() => {})
      )
    );
    renderWithProviders(<PatientDetailsPage />);
    expect(
      screen.getByText(/Cargando detalles del paciente.../i)
    ).toBeInTheDocument();
  });

  test("renders patient details after successful fetch", async () => {
    renderWithProviders(<PatientDetailsPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Detalles del Paciente: Juan Perez/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Email: juan.perez@example.com/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/RUT: 11.111.111-1/i)).toBeInTheDocument();
    });
  });

  test("renders emergency contacts list", async () => {
    renderWithProviders(<PatientDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Contactos de Emergencia/i)).toBeInTheDocument();
      expect(screen.getByText("Ana Perez")).toBeInTheDocument();
      expect(screen.getByText("987654321")).toBeInTheDocument();
      expect(screen.getByText("Hermana")).toBeInTheDocument();
    });
  });

  test("renders message when no emergency contacts are found", async () => {
    server.use(
      http.get("http://localhost:3000/api/pacientes/:id", () => {
        return HttpResponse.json([]);
      })
    );
    renderWithProviders(<PatientDetailsPage />);
    await waitFor(() => {
      expect(
        screen.getByText(
          /No hay contactos de emergencia registrados para este paciente./i
        )
      ).toBeInTheDocument();
    });
  });

  test("allows adding a new emergency contact", async () => {
    renderWithProviders(<PatientDetailsPage />);

    server.use(
      http.post(
        "http://localhost:3000/api/contactos-emergencia/:id",
        async ({ request }) => {
          const newContact = (await request.json()) as CreatePacienteFormValues;
          return HttpResponse.json(
            {
              ...newContact,
              contacto_emergencia_id: 102,
              fecha_registro: new Date().toISOString(),
            },
            { status: 201 }
          );
        }
      )
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Añadir Contacto/i })
    );
    expect(
      screen.getByText(/Añadir Contacto de Emergencia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("emergency-contact-form-name")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Submit Contact/i })
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Contacto de emergencia creado exitosamente."
      );
    });
  });

  test("allows editing an emergency contact", async () => {
    renderWithProviders(<PatientDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText("Ana Perez")).toBeInTheDocument();
    });

    server.use(
      http.put(
        "http://localhost:3000/api/contactos-emergencia/:id",
        async ({ request }) => {
          const updatedData =
            (await request.json()) as CreatePacienteFormValues;
          return HttpResponse.json(
            { ...updatedData, contacto_emergencia_id: 101 },
            { status: 200 }
          );
        }
      )
    );

    await userEvent.click(screen.getByRole("button", { name: /Editar/i }));
    expect(
      screen.getByText(/Editar Contacto de Emergencia/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("emergency-contact-form-name")).toHaveValue(
      "Ana Perez"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Submit Contact/i })
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Contacto de emergencia actualizado exitosamente."
      );
    });
  });

  test("allows deleting an emergency contact", async () => {
    renderWithProviders(<PatientDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText("Ana Perez")).toBeInTheDocument();
    });

    server.use(
      http.delete(
        "http://localhost:3000/api/contactos-emergencia/:id",
        ({ params }) => {
          if (params.id === "101") {
            return new HttpResponse(null, { status: 204 });
          }
          return new HttpResponse(null, { status: 404 });
        }
      )
    );

    await userEvent.click(screen.getByRole("button", { name: /Eliminar/i }));
    expect(
      screen.getByText(/¿Estás absolutamente seguro?/i)
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Eliminar" })
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Contacto de emergencia eliminado exitosamente."
      );
      expect(screen.queryByText("Ana Perez")).not.toBeInTheDocument();
    });
  });

  test("navigates back to patients list", async () => {
    renderWithProviders(<PatientDetailsPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Detalles del Paciente: Juan Perez/i)
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /Volver a Pacientes/i })
    );
    expect(mockUseNavigate).toHaveBeenCalledWith("/pacientes");
  });
});
