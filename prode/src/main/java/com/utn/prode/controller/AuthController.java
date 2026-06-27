package com.utn.prode.controller;

import com.utn.prode.dto.request.ChangePasswordRequestDTO;
import com.utn.prode.dto.request.LoginRequestDTO;
import com.utn.prode.dto.request.RegisterRequestDTO;
import com.utn.prode.dto.request.UpdateEmailRequestDTO;
import com.utn.prode.dto.response.AuthResponseDTO;
import com.utn.prode.dto.response.UsuarioPerfilResponseDTO;
import com.utn.prode.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioPerfilResponseDTO> obtenerPerfil(Authentication auth) {
        return ResponseEntity.ok(authService.obtenerPerfil(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<Void> actualizarEmail(Authentication auth,
            @Valid @RequestBody UpdateEmailRequestDTO dto) {
        authService.actualizarEmail(auth.getName(), dto);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/password")
    public ResponseEntity<Void> cambiarPassword(Authentication auth,
            @Valid @RequestBody ChangePasswordRequestDTO dto) {
        authService.cambiarPassword(auth.getName(), dto);
        return ResponseEntity.noContent().build();
    }
}