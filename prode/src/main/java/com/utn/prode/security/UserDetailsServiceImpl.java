package com.utn.prode.security;

import com.utn.prode.entity.Usuario;
import com.utn.prode.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Le dice a Spring Security cómo buscar un usuario en nuestra base de datos.
 *
 * Spring Security internamente llama a loadUserByUsername() cuando necesita
 * verificar credenciales. Nosotros le decimos: "buscalo en PostgreSQL".
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Buscamos el usuario en la BD
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + username));

        // Convertimos nuestro Usuario a un objeto que entiende Spring Security.
        // El rol lo pasamos como "ROLE_USER" o "ROLE_ADMIN" (convención de Spring).
        return new org.springframework.security.core.userdetails.User(
                usuario.getUsername(),
                usuario.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())));
    }
}