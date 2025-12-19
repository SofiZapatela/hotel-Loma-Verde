// src/pages/api/submit-reserva.ts

import type { APIRoute } from 'astro';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import nodemailer from 'nodemailer';

// --- Configuración de Firebase ---
// Asegúrate de definir estas variables de entorno en tu .env o en tu proveedor de hosting
const firebaseConfig = {
    apiKey: import.meta.env.FIREBASE_API_KEY,
    authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
    // ... otros datos
};

// Inicializa Firebase (solo si no se ha inicializado ya)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// --- Configuración de Email (Nodemailer) ---
// Usa un servicio de email real (como SendGrid, Mailgun o un servidor SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ejemplo: si usas Gmail
    auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASS,
    },
});

// --- Función Principal (API Route) ---
export const POST: APIRoute = async ({ request }) => {
    // 1. Obtener datos del formulario
    const data = await request.formData();
    
    // Extraemos los campos que sabemos que están en los campos ocultos del formulario
    const habitacion = data.get('Habitacion');
    const entrada = data.get('Fecha_Entrada');
    const salida = data.get('Fecha_Salida');
    const huespedes = data.get('Huespedes');
    const precio = data.get('Precio_Total_Estimado');
    
    // Extraemos los datos de contacto del cliente
    const nombre_cliente = data.get('Nombre');
    const email_cliente = data.get('Email');
    const telefono_cliente = data.get('Telefono') || 'N/A'; // Opcional

    // 2. Validación Básica
    if (!habitacion || !email_cliente) {
        return new Response(JSON.stringify({ error: 'Faltan campos esenciales del formulario.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // 3. Guardar la Reserva en Firestore
        await addDoc(collection(db, 'reservas'), {
            habitacion,
            fecha_entrada: entrada,
            fecha_salida: salida,
            huespedes: huespedes ? Number(huespedes) : 1, // Convertir a número si es posible
            precio_estimado: precio,
            nombre_cliente,
            email_cliente,
            telefono_cliente,
            estado: 'Solicitado', // Estado inicial
            timestamp: Timestamp.now(),
        });

        // 4. Enviar Emails
        
        // A. Notificación al Hotel
        await transporter.sendMail({
            from: import.meta.env.EMAIL_USER,
            to: import.meta.env.HOTEL_EMAIL, // Tu email de recepción de reservas
            subject: `¡NUEVA SOLICITUD DE RESERVA! - ${habitacion}`,
            html: `Se ha recibido una nueva solicitud de reserva. Cliente: ${nombre_cliente}, Email: ${email_cliente}. Por favor, revisa el dashboard.`,
        });

        // B. Confirmación al Cliente
        await transporter.sendMail({
            from: import.meta.env.EMAIL_USER,
            to: String(email_cliente),
            subject: 'Confirmación de Solicitud de Reserva - Loma Verde Lodge',
            html: `Hola ${nombre_cliente}, hemos recibido tu solicitud de pre-reserva para la habitación ${habitacion} del ${entrada} al ${salida}. Te contactaremos en 24 horas.`,
        });

        // 5. Redirección de Éxito
        // IMPORTANTE: Devolvemos una respuesta para que Astro/Netlify sepa qué hacer
        // Redirigimos al cliente a la página de agradecimiento
        const params = new URLSearchParams({ 
            habitacion: String(habitacion), 
            entrada: String(entrada), 
            salida: String(salida) 
        }).toString();
        
        return new Response(null, {
            status: 302, // Código de redirección temporal
            headers: {
                Location: `/gracias-reserva?${params}`, // Redirección con parámetros
            },
        });

    } catch (error) {
        console.error('Error procesando la reserva:', error);
        return new Response(JSON.stringify({ error: 'Error interno al procesar la solicitud.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};