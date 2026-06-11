package com.utn.prode.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utilidad para generar y validar tokens JWT.
 *
 * Un token JWT tiene 3 partes separadas por puntos:
 * HEADER.PAYLOAD.FIRMA
 *
 * En el PAYLOAD guardamos: username, rol y fecha de expiración.
 * La FIRMA garantiza que nadie modificó el token.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs; // 86400000 = 24 horas en milisegundos

    /**
     * Genera la clave de firma a partir del secreto en application.properties.
     */
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Genera un token JWT para el usuario autenticado.
     * Incluye username y rol en el payload.
     */
    public String generarToken(String username, String rol) {
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    /**
     * Extrae el username del token (el "subject").
     */
    public String extraerUsername(String token) {
        return parsear(token).getPayload().getSubject();
    }

    /**
     * Extrae el rol del token.
     */
    public String extraerRol(String token) {
        return parsear(token).getPayload().get("rol", String.class);
    }

    /**
     * Verifica si el token es válido (firma correcta y no expirado).
     * Devuelve true si todo está bien, false si algo falla.
     */
    public boolean esValido(String token) {
        try {
            parsear(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token inválido, expirado o malformado
            return false;
        }
    }

    /**
     * Parsea el token y lanza excepción si es inválido.
     */
    private Jws<Claims> parsear(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token);
    }
}