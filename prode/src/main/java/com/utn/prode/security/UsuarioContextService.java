package com.utn.prode.security;

import com.utn.prode.entity.Usuario;
import com.utn.prode.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

/**
 * Componente helper para obtener el usuario autenticado en el contexto actual.
 *
 * El JwtFilter registra el username en SecurityContextHolder.
 * Este componente lo lee y busca el Usuario completo en la BD.
 *
 * Se usa en los controllers para obtener el usuarioId del token
 * sin necesidad de que el cliente lo mande en el body.
 */
@Component
@RequiredArgsConstructor
public class UsuarioContextService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Devuelve el Usuario completo del token JWT activo.
     */
    public Usuario getUsuarioAutenticado() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException(
                        "Usuario autenticado no encontrado en BD: " + username));
    }
}