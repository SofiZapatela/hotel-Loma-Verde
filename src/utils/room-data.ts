/**
 * src/utils/room-data.ts
 * Fuente de verdad centralizada para el inventario estático y utilidades de fecha.
 * Este archivo se puede importar con seguridad tanto en el servidor (Astro) como en el cliente.
 */

// ----------------------------------------------------
// 1. INVENTARIO TOTAL Y DATOS DE HABITACIÓN (Fuente Única de Verdad)
// ----------------------------------------------------
export const ROOM_DATA = {
    'woods': { 
        nombre: 'Habitación Woods', 
        unidades: 5, // Inventario total
        descripcion: 'Amplia, con vista al bosque.', 
        precioBase: 180 
    },
    'green': { 
        nombre: 'Habitación Green', 
        unidades: 1,
        descripcion: 'Fresca, con vista a las palmeras.', 
        precioBase: 150
    },
    'lodge': { 
        nombre: 'Habitación Lodge', 
        unidades: 2,
        descripcion: 'Amplia habitación, con terraza privada.', 
        precioBase: 220
    }, 
};

// Objeto simple que solo contiene el inventario, útil para la lógica de chequeo.
export const ROOM_INVENTORY = Object.fromEntries(
    Object.entries(ROOM_DATA).map(([key, value]) => [key, { unidades: value.unidades }])
);


// ----------------------------------------------------
// 2. UTILIDADES DE FECHA
// ----------------------------------------------------
/**
 * Crea un objeto Date localizando correctamente la fecha YYYY-MM-DD
 * al inicio del día (00:00:00) en la zona horaria local.
 * @param {string} dateString - Formato 'YYYY-MM-DD'.
 * @returns {Date} Objeto Date.
 */
export function createLocalTimeDate(dateString: string): Date {
    // Aseguramos que dateString sea un string válido antes de split, aunque la función ya lo tipa.
    if (typeof dateString !== 'string') {
        throw new Error("Invalid dateString provided to createLocalTimeDate.");
    }
    
    const parts = dateString.split('-');
    // Mes es 0-indexado en JS: parts[1] - 1
    // Usamos parseInt para asegurar que sean números
    return new Date(
        parseInt(parts[0]), 
        parseInt(parts[1]) - 1, 
        parseInt(parts[2])
    );
}