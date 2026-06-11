package com.utn.prode.config;

import com.utn.prode.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración central de seguridad.
 *
 * Define dos cosas importantes:
 * 1. Qué endpoints son públicos y cuáles necesitan token JWT
 * 2. Qué endpoints son exclusivos de ADMIN
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Desactivamos CSRF porque usamos JWT (no cookies de sesión)
                .csrf(AbstractHttpConfigurer::disable)

                // Configuramos CORS para que el frontend pueda llamar a la API
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Sin sesión: cada request se autentica con el token (STATELESS)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // -------------------------------------------------------
                // REGLAS DE ACCESO POR ENDPOINT
                // -------------------------------------------------------
                .authorizeHttpRequests(auth -> auth

                        // PÚBLICO: registro e inicio de sesión (no necesitan token)
                        .requestMatchers("/api/auth/**").permitAll()

                        // PÚBLICO: ver partidos y fechas (cualquiera puede verlos)
                        .requestMatchers(HttpMethod.GET, "/api/fechas/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/partidos/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/equipos/**").authenticated()

                        // SOLO ADMIN: crear, modificar y eliminar equipos
                        .requestMatchers(HttpMethod.POST, "/api/equipos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/equipos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/equipos/**").hasRole("ADMIN")

                        // SOLO ADMIN: gestionar fechas (crear, editar, eliminar)
                        .requestMatchers(HttpMethod.POST, "/api/fechas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/fechas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/fechas/**").hasRole("ADMIN")

                        // SOLO ADMIN: gestionar partidos y cargar resultados
                        .requestMatchers(HttpMethod.POST, "/api/partidos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/partidos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/partidos/**").hasRole("ADMIN")
                        .requestMatchers("/api/partidos/*/resultado").hasRole("ADMIN")
                        .requestMatchers("/api/partidos/*/estado").hasRole("ADMIN")

                        // USUARIO AUTENTICADO: pronósticos, ranking y grupos
                        .requestMatchers("/api/pronosticos/**").authenticated()
                        .requestMatchers("/api/ranking/**").authenticated()
                        .requestMatchers("/api/grupos/**").authenticated()

                        // Cualquier otro endpoint requiere autenticación
                        .anyRequest().authenticated())

                // Registramos nuestro filtro JWT ANTES del filtro de usuario/contraseña
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * BCrypt para hashear contraseñas.
     * Factor de costo 10 (recomendado: balance entre seguridad y velocidad).
     * Nunca se almacena la contraseña original — RNF1 del PDF.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * AuthenticationManager: necesario para el proceso de login.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS: permite que el frontend (HTML/JS en otro puerto) llame a la API.
     * En desarrollo permite cualquier origen. En producción se restringe.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}