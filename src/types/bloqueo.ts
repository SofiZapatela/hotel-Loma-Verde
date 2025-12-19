// src/types/db.ts o src/types/bloqueo.ts

/**
 * Define la estructura de un documento de bloqueo de inventario
 * guardado en Firestore.
 */
export type Bloqueo = {
    id: string; // ID del documento en Firestore
    habitacion: string; // Nombre/ID de la habitación ('woods', 'green', etc.)
    fecha_inicio: string; // Fecha de inicio del bloqueo (YYYY-MM-DD)
    fecha_fin: string; // Fecha de fin del bloqueo (YYYY-MM-DD)
    // Puedes añadir otros campos como 'cantidad_bloqueada', 'estado', etc.
};