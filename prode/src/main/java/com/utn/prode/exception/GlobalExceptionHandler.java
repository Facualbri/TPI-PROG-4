package com.utn.prode.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.*;

/**
 * Captura todas las excepciones del sistema y las convierte en
 * respuestas JSON con el código HTTP correcto.
 *
 * Sin esto, Spring devuelve páginas HTML de error que el frontend no puede
 * leer.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------
    // Excepción de negocio genérica (400 Bad Request)
    // -------------------------------------------------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // -------------------------------------------------------
    // Recurso no encontrado (404 Not Found)
    // -------------------------------------------------------
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // -------------------------------------------------------
    // Validación de DTOs (@Valid falló) — devuelve todos los errores de campo
    // -------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> erroresCampos = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            erroresCampos.put(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", 400);
        body.put("error", "Datos inválidos");
        body.put("campos", erroresCampos);
        return ResponseEntity.badRequest().body(body);
    }

    // -------------------------------------------------------
    // Sin permisos (403 Forbidden) — USER intentando hacer algo de ADMIN
    // -------------------------------------------------------
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "No tenés permisos para realizar esta acción");
    }

    // -------------------------------------------------------
    // Tipo de argumento inválido (400) — ej: UUID mal formado
    // -------------------------------------------------------
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = String.format("El valor '%s' no es válido para '%s'", ex.getValue(), ex.getName());
        return buildError(HttpStatus.BAD_REQUEST, msg);
    }

    // -------------------------------------------------------
    // Parámetro obligatorio faltante (400)
    // -------------------------------------------------------
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        String msg = "El parámetro '" + ex.getParameterName() + "' es obligatorio";
        return buildError(HttpStatus.BAD_REQUEST, msg);
    }

    // -------------------------------------------------------
    // Violación de integridad de datos (409 Conflict)
    // -------------------------------------------------------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return buildError(HttpStatus.CONFLICT, "El dato que intentás usar ya está registrado");
    }

    // -------------------------------------------------------
    // Cualquier otro error no controlado (500)
    // -------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor: " + ex.getMessage());
    }

    // -------------------------------------------------------
    // Método auxiliar que construye la respuesta de error
    // -------------------------------------------------------
    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String mensaje) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", mensaje);
        return ResponseEntity.status(status).body(body);
    }
}