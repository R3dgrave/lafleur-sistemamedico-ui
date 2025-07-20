// src/setupTests.ts
import '@testing-library/jest-dom'; // Extiende 'expect' con matchers de DOM
import { server } from './mocks/server'; // Importa el servidor MSW que crearemos
import { afterAll, afterEach, beforeAll } from 'vitest';

// Configuración global para MSW
beforeAll(() => server.listen()); // Inicia el servidor de mock antes de todas las pruebas
afterEach(() => server.resetHandlers()); // Restablece los handlers de mock después de cada prueba
afterAll(() => server.close()); // Cierra el servidor de mock después de todas las pruebas