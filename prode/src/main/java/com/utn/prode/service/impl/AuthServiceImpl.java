package com.utn.prode.service.impl;

import com.utn.prode.dto.request.ChangePasswordRequestDTO;
import com.utn.prode.dto.request.LoginRequestDTO;
import com.utn.prode.dto.request.RegisterRequestDTO;
import com.utn.prode.dto.request.UpdateEmailRequestDTO;
import com.utn.prode.dto.response.AuthResponseDTO;
import com.utn.prode.dto.response.UsuarioPerfilResponseDTO;
import com.utn.prode.entity.Usuario;
import com.utn.prode.repository.UsuarioRepository;
import com.utn.prode.security.JwtUtil;
import com.utn.prode.service.interfaces.AuthService;
import java.util.NoSuchElementException;
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
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("El username '" + dto.getUsername() + "' ya está en uso");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("El email '" + dto.getEmail() + "' ya está registrado");
        }

        Usuario nuevo = Usuario.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .build();

        usuarioRepository.save(nuevo);

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
        Usuario usuario = usuarioRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        String token = jwtUtil.generarToken(usuario.getUsername(), usuario.getRol().name());
        return AuthResponseDTO.builder()
                .token(token)
                .username(usuario.getUsername())
                .rol(usuario.getRol().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioPerfilResponseDTO obtenerPerfil(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
        return UsuarioPerfilResponseDTO.builder()
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .build();
    }

    @Override
    @Transactional
    public void actualizarEmail(String username, UpdateEmailRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        if (usuarioRepository.existsByEmail(dto.getEmail()) &&
                !usuario.getEmail().equals(dto.getEmail())) {
            throw new IllegalArgumentException("El email '" + dto.getEmail() + "' ya está registrado");
        }

        usuario.setEmail(dto.getEmail());
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void cambiarPassword(String username, ChangePasswordRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        usuarioRepository.save(usuario);
    }
}