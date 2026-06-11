package com.utn.prode.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que se ejecuta UNA VEZ por cada request HTTP.
 *
 * Lo que hace paso a paso:
 * 1. Lee el header "Authorization" del request
 * 2. Extrae el token (saca el "Bearer " del principio)
 * 3. Valida el token con JwtUtil
 * 4. Si es válido, le dice a Spring quién es el usuario y qué rol tiene
 * 5. Spring Security permite o rechaza el acceso según la configuración
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Leer el header Authorization
        String authHeader = request.getHeader("Authorization");

        // 2. Si no hay header o no empieza con "Bearer ", dejamos pasar sin autenticar
        // (los endpoints públicos como /auth/login no necesitan token)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Sacar el token (todo lo que va después de "Bearer ")
        String token = authHeader.substring(7);

        // 4. Validar el token
        if (!jwtUtil.esValido(token)) {
            // Token inválido o expirado → respondemos 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Token inválido o expirado\"}");
            return;
        }

        // 5. Extraer username y rol del token
        String username = jwtUtil.extraerUsername(token);
        String rol = jwtUtil.extraerRol(token);

        // 6. Crear el objeto de autenticación que usa Spring Security internamente
        // Formato del rol: "ROLE_USER" o "ROLE_ADMIN"
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                username,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + rol)));

        // 7. Registrar la autenticación en el contexto de Spring Security
        // A partir de acá, Spring sabe quién es el usuario en este request
        SecurityContextHolder.getContext().setAuthentication(auth);

        // 8. Continuar con el resto de la cadena de filtros
        filterChain.doFilter(request, response);
    }
}