package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.ChangePasswordRequestDTO;
import com.utn.prode.dto.request.LoginRequestDTO;
import com.utn.prode.dto.request.RegisterRequestDTO;
import com.utn.prode.dto.request.UpdateEmailRequestDTO;
import com.utn.prode.dto.response.AuthResponseDTO;
import com.utn.prode.dto.response.UsuarioPerfilResponseDTO;

public interface AuthService {
    AuthResponseDTO registrar(RegisterRequestDTO dto);

    AuthResponseDTO login(LoginRequestDTO dto);

    UsuarioPerfilResponseDTO obtenerPerfil(String username);

    void actualizarEmail(String username, UpdateEmailRequestDTO dto);

    void cambiarPassword(String username, ChangePasswordRequestDTO dto);
}