package com.utn.prode.service.impl;

import com.utn.prode.dto.request.LoginRequestDTO;
import com.utn.prode.dto.request.RegisterRequestDTO;
import com.utn.prode.dto.response.AuthResponseDTO;
import com.utn.prode.entity.Usuario;
import com.utn.prode.repository.UsuarioRepository;
import com.utn.prode.security.JwtUtil;
import com.utn.prode.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public AuthResponseDTO registrar(RegisterRequestDTO dto) {
        // Verificar que username y email no estén en uso
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("El username '" + dto.getUsername() + "' ya está en uso");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("El email '" + dto.getEmail() + "' ya está registrado");
        }

        // Crear el usuario con la contraseña hasheada (nunca en texto plano - RNF1)
        Usuario nuevo = Usuario.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .build(); // rol = USER por defecto (@Builder.Default)

        usuarioRepository.save(nuevo);

        // Generar y devolver el token JWT directamente
        String token = jwtUtil.generarToken(nuevo.getUsername(), nuevo.getRol().name());
        return AuthResponseDTO.builder()
                .token(token)
                .username(nuevo.getUsername())
                .rol(nuevo.getRol().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        // Buscar usuario por username
        Usuario usuario = usuarioRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        // Comparar contraseña con BCrypt (matches hace la comparación segura)
        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        // Generar token y devolverlo
        String token = jwtUtil.generarToken(usuario.getUsername(), usuario.getRol().name());
        return AuthResponseDTO.builder()
                .token(token)
                .username(usuario.getUsername())
                .rol(usuario.getRol().name())
                .build();
    }
}