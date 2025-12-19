// /public/availability_checker.js

// ----------------------------------------------------
// 1. INVENTARIO TOTAL Y DATOS DE HABITACIÓN (Solo se usa internamente o en cliente)
// ----------------------------------------------------
// Si necesitas acceder a esto en el servidor (reservar.astro), USA src/utils/room-data.ts
export const ROOM_DATA = {
    'woods': { 
        nombre: 'Habitación Woods', 
        unidades: 5, // ⭐️ ESTO ES CRUCIAL: Tu inventario total
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
function createLocalTimeDate(dateString) {
    if (dateString.includes("T")) {
        // Si viene con horas o UTC → lo pasamos a Y-M-D local seguro
        const date = new Date(dateString);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    const parts = dateString.split('-');
    return new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
    );
}
// Mantenemos la exportación para que contacto.astro la pueda usar.
export { createLocalTimeDate }; 

// ----------------------------------------------------
// 3. LÓGICA DE CHEQUEO DE DISPONIBILIDAD (Firestore - Contiene import HTTPS)
// ----------------------------------------------------

// ⭐️ ESTA LÍNEA ES LA QUE CAUSA EL ERROR EN EL SERVIDOR DE ASTRO ⭐️
import { collection, query, where, getDocs, Timestamp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

/**
 * Verifica la disponibilidad de una habitación en un rango de fechas.
 */
export async function checkRoomAvailability(habitacionId, fechaInicioStr, fechaFinStr, db) {
    // 1. Obtener Capacidad Total
    const inventario = ROOM_INVENTORY[habitacionId];
    if (!inventario) {
        console.error(`Inventario no definido para la habitación: ${habitacionId}`);
        return 0;
    }
    const capacidadTotal = inventario.unidades;

    // 2. Establecer el Rango de Búsqueda (Fechas)
    const startReq = createLocalTimeDate(fechaInicioStr);
    const endReq = createLocalTimeDate(fechaFinStr);
    
    if (endReq <= startReq) {
        return capacidadTotal;
    }

    // 3. Consultar Bloqueos Superpuestos (Sólo por habitación)
    try {
        const bloqueosRef = collection(db, 'bloqueos');
        const q = query(
            bloqueosRef, 
            where('habitacion', '==', habitacionId)
        );

        const querySnapshot = await getDocs(q);
        const bloqueosExistentes = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            bloqueosExistentes.push({
                ...data,
                fecha_inicio: createLocalTimeDate(data.fecha_inicio),
                fecha_fin: createLocalTimeDate(data.fecha_fin)
            });
        });

        // 4. Calcular el Bloqueo Máximo en el Rango Solicitado
        let maxBloqueado = 0;
        
        for (let d = new Date(startReq); d < endReq; d.setDate(d.getDate() + 1)) {
            let bloqueadoEnDia = 0;
            
            bloqueosExistentes.forEach(bloqueo => {
                if (d >= bloqueo.fecha_inicio && d < bloqueo.fecha_fin) {
                    bloqueadoEnDia += (bloqueo.cantidad_bloqueada || 1); 
                }
            });

            if (bloqueadoEnDia > maxBloqueado) {
                maxBloqueado = bloqueadoEnDia;
            }
        }
        
        // 5. Devolver la Disponibilidad
        const unidadesDisponibles = capacidadTotal - maxBloqueado;
        
        return unidadesDisponibles >= 0 ? unidadesDisponibles : 0;
        
    } catch (error) {
        console.error("Error en checkRoomAvailability al consultar Firestore:", error);
        return 0; 
    }
}