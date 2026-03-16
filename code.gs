const SHEET_ID = "1guSWoexEcUE8MaBYyyU7NwuaUycjGi_zDwI_dC1qySU";
const SHEET_NAME = "Informacion de contacto";
const RECIPIENTS = "theakdemiawebve@gmail.com,morobello@akdemia.com";
const ADMIN_ON_ERROR = "theakdemiawebve@gmail.com";
const EMAIL_SUBJECT_PREFIX = "Nueva solicitud - Akdemia Edge";

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function processForm(form) {
  try {
    Logger.log("processForm invoked. Usuario efectivo: %s", Session.getEffectiveUser().getEmail());
    Logger.log("Raw form payload: %s", JSON.stringify(form));

    if (!form || Object.keys(form).length === 0) {
      Logger.log("processForm: form vacío o sin claves.");
      return { status: 'error', message: 'Datos del formulario vacíos en el servidor.' };
    }

    var ss;
    try {
      ss = SpreadsheetApp.openById(SHEET_ID);
    } catch (openErr) {
      Logger.log("ERROR al abrir spreadsheet por ID: %s", String(openErr));
      try {
        MailApp.sendEmail({
          to: ADMIN_ON_ERROR,
          subject: "[ALERTA] No se pudo abrir Spreadsheet (processForm)",
          body: "Error al abrir Spreadsheet con ID: " + SHEET_ID + "\n\nError: " + String(openErr) + "\n\nPayload: " + JSON.stringify(form)
        });
      } catch (mailErr) {
        Logger.log("ERROR enviando alerta al admin: %s", String(mailErr));
      }
      return { status: 'error', message: 'No se pudo abrir la hoja de cálculo. Contacte al administrador.' };
    }

    Logger.log("Spreadsheet abierto: ID=%s, URL=%s, Nombre=%s", ss.getId(), ss.getUrl(), ss.getName());

    var desiredName = (SHEET_NAME || "").toString();
    var sheet = ss.getSheetByName(desiredName);
    
    if (!sheet) {
      var trimmed = desiredName.trim();
      if (trimmed !== desiredName) {
        sheet = ss.getSheetByName(trimmed);
      }
    }
    
    if (!sheet) {
      var normTarget = normalizeName(desiredName);
      var candidates = ss.getSheets().filter(function(s) {
        return normalizeName(s.getName()).indexOf(normTarget) !== -1;
      });
      if (candidates.length > 0) sheet = candidates[0];
    }
    
    if (!sheet) {
      Logger.log("No se encontró hoja por nombre '%s'. Se usará la primera pestaña.", desiredName);
      var allSheets = ss.getSheets();
      sheet = allSheets && allSheets.length ? allSheets[0] : null;
      if (!sheet) {
        var createName = (desiredName && desiredName.trim()) || "Respuestas";
        sheet = ss.insertSheet(createName);
        sheet.appendRow(["Timestamp","Nombre del Colegio","Ubicación","Cantidad de alumnos","Mayor reto","Nombre y Apellido","Correo","Teléfono","Cargo"]);
        Logger.log("Se creó nueva hoja '%s' con encabezados.", createName);
      }
    }

    Logger.log("Hoja destino: %s", sheet.getName());

    var timestamp = new Date();
    var row = [
      timestamp,
      safeGet(form, 'colegio'),
      safeGet(form, 'ubicacion'),
      safeGet(form, 'rango_alumnos'),
      safeGet(form, 'mayor_reto'),
      safeGet(form, 'nombre'),
      safeGet(form, 'correo'),
      safeGet(form, 'telefono'),
      safeGet(form, 'cargo')
    ];

    Logger.log("Row to write: %s", JSON.stringify(row));

    try {
      var lastRow = sheet.getLastRow();
      var writeRowIndex = lastRow + 1;
      var nCols = row.length;
      sheet.getRange(writeRowIndex, 1, 1, nCols).setValues([row]);
      SpreadsheetApp.flush();
      Logger.log("Fila escrita en spreadsheet '%s', hoja '%s', fila %s.", ss.getName(), sheet.getName(), writeRowIndex);
    } catch (writeErr) {
      Logger.log("ERROR al escribir fila: %s", String(writeErr));
      try {
        MailApp.sendEmail({
          to: ADMIN_ON_ERROR,
          subject: "[ALERTA] Fallo escritura en Sheet - Akdemia",
          body: "Error al escribir fila en spreadsheet ID: " + SHEET_ID + "\nHoja: " + sheet.getName() + "\nError: " + String(writeErr) + "\n\nPayload: " + JSON.stringify(form)
        });
      } catch (mailErr2) {
        Logger.log("ERROR al enviar email de alerta: %s", String(mailErr2));
      }
      return { status: 'error', message: 'Fallo al guardar la información en la hoja.' };
    }

    var subject = EMAIL_SUBJECT_PREFIX + " — " + (row[5] || row[1] || '');
    var bodyLines = [
      "Nueva solicitud recibida desde la landing Akdemia Edge:",
      "",
      "Timestamp: " + timestamp,
      "Nombre del Colegio: " + row[1],
      "Ubicación: " + row[2],
      "Cantidad de alumnos: " + row[3],
      "Mayor reto: " + row[4],
      "Nombre y Apellido: " + row[5],
      "Correo electrónico: " + row[6],
      "Teléfono: " + row[7],
      "Cargo: " + row[8],
      "",
      "Este correo fue generado automáticamente."
    ];
    try {
      MailApp.sendEmail({
        to: RECIPIENTS,
        subject: subject,
        body: bodyLines.join("\n")
      });
    } catch (mailErr) {
      Logger.log("WARN: fallo al enviar email principal: %s", String(mailErr));
      try {
        MailApp.sendEmail({
          to: ADMIN_ON_ERROR,
          subject: "[ALERTA] Fallo al enviar email notificación",
          body: "Se guardó la fila en la hoja pero falló el envío de email.\nError: " + String(mailErr) + "\nPayload: " + JSON.stringify(form)
        });
      } catch (ignored) {
        Logger.log("ERROR secundario al notificar admin: %s", String(ignored));
      }
    }

    return { status: 'success', message: 'Envío guardado y (si aplica) correo enviado' };

  } catch (err) {
    Logger.log("processForm EXCEPTION: %s", String(err));
    try {
      MailApp.sendEmail({
        to: ADMIN_ON_ERROR,
        subject: "[ALERTA] Exception en processForm",
        body: "Error en processForm: " + String(err) + "\n\nPayload: " + JSON.stringify(form)
      });
    } catch (ignored2) {
      Logger.log("No se pudo enviar mail de alerta: %s", String(ignored2));
    }
    return { status: 'error', message: 'Error al procesar el formulario: ' + (err && err.message ? err.message : String(err)) };
  }
}

function safeGet(obj, key) {
  if (!obj) return '';
  var v = obj[key];
  return (v === null || v === undefined) ? '' : v;
}

function normalizeName(s) {
  if (!s) return '';
  return s.toString().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function listSheetNames() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var names = ss.getSheets().map(function(s){ return s.getName(); });
  Logger.log("Sheets: %s", names.join(" | "));
  return names;
}

function testAppend() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheets()[0];
  var now = new Date();
  sheet.appendRow([now, "TEST", "TEST", "TEST", "TEST", "TEST", "test@example.com", "000", "Cargo"]);
  Logger.log("Test appended to sheet '%s'", sheet.getName());
}

function testReadLastRows() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheets()[0];
  var r = sheet.getLastRow();
  var c = sheet.getLastColumn();
  var data = sheet.getRange(Math.max(1, r-4), 1, Math.min(5, r), c).getValues();
  Logger.log("Last rows: %s", JSON.stringify(data));
  return data;
}
