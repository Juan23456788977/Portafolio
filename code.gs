/**
 * ============================================================================
 * @file Código.gs (Backend / Server-Side)
 * @project Webinar Módulo de Admisión - Akdemia
 * @author Juan Cortez
 * @description Controlador principal para la captura de leads, persistencia en 
 * Google Sheets y despacho de correos transaccionales con inyección de assets.
 * ============================================================================
 */

const SHEET_ID = "1guSWoexEcUE8MaBYyyU7NwuaUycjGi_zDwI_dC1qySU";
const SHEET_NAME = "Informacion de contacto";
const RECIPIENTS = "theakdemiawebve@gmail.com,morobello@akdemia.com";

// ID extraído del logotipo en Drive (Evita el Error 403 de servidores externos) - JC
const GOOGLE_DRIVE_LOGO_ID = "1VwsQDFfbGOW3GX1cyvbO814DAhxu1nFW";

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Webinar Exclusivo: Módulo de Admisión Akdemia")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

function processForm(form) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    
    const timestamp = new Date();
    const row = [
      timestamp, form.colegio || '', form.ubicacion || '', form.rango_alumnos || '',
      form.nombre || '', form.correo || '', form.telefono || '', form.cargo || ''
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    // Cálculo del consecutivo dinámico para el asunto del correo interno
    const numeroRegistro = sheet.getLastRow() - 1;

    // Fetch del asset e inyección mediante Content-ID (CID) para evitar bloqueos anti-spam - JC
    const urlDrive = "https://drive.google.com/uc?export=download&id=" + GOOGLE_DRIVE_LOGO_ID;
    const logoBlob = UrlFetchApp.fetch(urlDrive).getBlob().setName("logoAkdemia");

    // ---------------------------------------------------------
    // TEMPLATE 1: Notificación Interna (Akdemia Team)
    // ---------------------------------------------------------
    const adminSubject = `📌 NUEVO REGISTRO (N° ${numeroRegistro}) - Webinar Módulo de Admisión: ${form.colegio || 'Institución'}`;
    
    const htmlAdminEmail = `
      <div style="font-family: Futura, 'Century Gothic', AppleGothic, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background-color: #1A6899; padding: 40px 20px; text-align: center; border-bottom: 4px solid #0f172a;">
          <img src="cid:logoAkdemia" alt="Akdemia Logotipo" style="max-width: 180px; width: 100%; height: auto; display: inline-block; border: 0;">
        </div>
        <div style="background-color: #0f172a; padding: 15px 25px; text-align: center;">
          <h2 style="color: #e0f2fe; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">🚨 NUEVO REGISTRO RECIBIDO &bull; Registro N° ${numeroRegistro}</h2>
        </div>
        <div style="padding: 35px 30px; background-color: #ffffff;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
            Estimado equipo, se ha procesado formalmente una nueva inscripción institucional para el encuentro digital del <strong>Módulo de Admisión</strong> programado para el 28 de Mayo de 2026. A continuación, compartimos los detalles de la solicitud:
          </p>
          <h3 style="color: #1A6899; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">🏫 Información Institucional</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 35%;"><strong>Colegio:</strong></td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 15px; font-weight: 600;">${form.colegio}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;"><strong>Ubicación:</strong></td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 15px;">${form.ubicacion}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;"><strong>Volumen de Alumnos:</strong></td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 15px;"><span style="background-color: #e0f2fe; color: #1A6899; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: 600;">${form.rango_alumnos.replace('_', ' ')} alumnos</span></td>
            </tr>
          </table>
          <h3 style="color: #1A6899; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">👤 Información de Contacto</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 35%;"><strong>Representante:</strong></td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 15px; font-weight: 600;">${form.nombre}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;"><strong>Cargo:</strong></td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 15px; color: #475569;">${form.cargo}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
              <td style="padding: 10px 0; font-size: 15px;"><a href="mailto:${form.correo}" style="color: #1A6899; text-decoration: none; font-weight: 500;">${form.correo}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;"><strong>Teléfono / WhatsApp:</strong></td>
              <td style="padding: 10px 0; font-size: 15px;"><a href="https://wa.me/${form.telefono.replace(/[^0-9]/g, '')}" style="color: #16a34a; text-decoration: none; font-weight: 500;">${form.telefono} 💬</a></td>
            </tr>
          </table>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Desarrollado para Akdemia por Juan Cortez.</p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: RECIPIENTS,
      subject: adminSubject,
      htmlBody: htmlAdminEmail,
      inlineImages: { logoAkdemia: logoBlob }
    });

    // ---------------------------------------------------------
    // TEMPLATE 2: Confirmación Externa (Cliente VIP)
    // ---------------------------------------------------------
    const meetLink = "https://meet.google.com/zku-giqg-xby"; 
    const userSubject = "✅ Confirmación de registro: Webinar Módulo de Admisión Akdemia";
    
    const htmlEmail = `
      <div style="font-family: Futura, 'Century Gothic', AppleGothic, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eef2f6; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background-color: #1A6899; padding: 40px 20px; text-align: center;">
          <img src="cid:logoAkdemia" alt="Akdemia" style="max-width: 170px; width: 100%; height: auto; display: inline-block; border: 0;">
        </div>
        <div style="padding: 45px 35px;">
          <h2 style="color: #1A6899; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">¡Tu cupo está confirmado, ${form.nombre.split(' ')[0]}!</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px; margin-top: 15px;">
            Nos entusiasma oficializar tu participación en nuestro próximo encuentro exclusivo. Será un placer contar con la representación de <strong>${form.colegio}</strong> para descubrir cómo digitalizar y optimizar el proceso de inscripciones de tu institución.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #1A6899; padding: 20px; border-radius: 8px; margin-bottom: 35px;">
            <p style="margin: 0 0 10px 0; color: #1a202c; font-size: 15px;">📅 <strong>Fecha:</strong> Jueves, 28 de Mayo de 2026</p>
            <p style="margin: 0 0 10px 0; color: #1a202c; font-size: 15px;">⏰ <strong>Hora:</strong> 10:00 a.m. (Hora de Venezuela)</p>
            <p style="margin: 0; color: #1a202c; font-size: 15px;">💻 <strong>Modalidad:</strong> En vivo vía Google Meet</p>
          </div>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            Por favor, <strong>guarda este correo</strong>. Para ingresar a la sala el día del evento, solo tendrás que hacer clic en el siguiente enlace de acceso directo:
          </p>
          <table cellspacing="0" cellpadding="0" border="0" style="margin: 35px auto;">
            <tr>
              <td style="border-radius: 50px; background-color: #1A6899; text-align: center;">
                <a href="${meetLink}" target="_blank" style="padding: 18px 36px; display: block; color: #ffffff; font-family: Futura, 'Century Gothic', AppleGothic, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                  Unirme al Webinar
                </a>
              </td>
            </tr>
          </table>
        </div>
        <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Agradecemos su confianza,</p>
          <p style="color: #1A6899; font-size: 16px; font-weight: bold; margin: 0;">El Equipo de Akdemia</p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: form.correo,
      subject: userSubject,
      htmlBody: htmlEmail,
      inlineImages: { logoAkdemia: logoBlob }
    });

    return { status: 'success' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
