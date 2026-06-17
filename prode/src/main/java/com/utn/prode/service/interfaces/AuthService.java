package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.LoginRequestDTO;
import com.utn.prode.dto.request.RegisterRequestDTO;
import com.utn.prode.dto.response.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO registrar(RegisterRequestDTO dto);

    AuthResponseDTO login(LoginRequestDTO dto);
}