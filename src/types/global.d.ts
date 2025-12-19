declare interface Window {
  __AOS?: boolean;
}

/**
 * Global declarations for variables provided by the Canvas environment.
 * Including this file in your tsconfig.json should resolve "Cannot find name '__app_id'" errors.
 */

// MANDATORY: The current application ID provided by the Canvas environment.
declare const __app_id: string | undefined;

// MANDATORY: The Firebase configuration object provided by the Canvas environment.
declare const __firebase_config: string | undefined;

// MANDATORY: The Firebase custom authentication token provided by the Canvas environment.
declare const __initial_auth_token: string | undefined;

// Optional: Define a base type for generic objects if needed globally (often useful in JS/TS contexts)
type AnyObject = { [key: string]: any };

/// <reference types="astro/client" />

// Esta sección es para declarar variables globales de runtime (como si se usaran en <script> sin import)
// Aunque no deberían usarse en el frontmatter, las mantenemos por si el código JS/TS del cliente las usa directamente.
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string | undefined;


// ⭐️ CORRECCIÓN CRÍTICA: Aseguramos que la augmentación sea vista por TypeScript. ⭐️
// Extendemos el tipo 'Locals' para que el compilador sepa que estas propiedades existen en 'Astro.locals'
declare module 'astro' {
    export interface Locals {
        __app_id: string;
        __firebase_config: string;
        __initial_auth_token?: string; // Es opcional
    }
}