package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.PartidoRequestDTO;
import com.utn.prode.dto.request.ResultadoRequestDTO;
import com.utn.prode.dto.response.PartidoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface PartidoService {
    PartidoResponseDTO crear(PartidoRequestDTO dto);

    PartidoResponseDTO actualizar(UUID id, PartidoRequestDTO dto);

    void eliminar(UUID id);

    PartidoResponseDTO buscarPorId(UUID id);

    List<PartidoResponseDTO> listarPorFecha(UUID fechaId);

    PartidoResponseDTO pasarAEnJuego(UUID id);

    PartidoResponseDTO registrarResultado(UUID id, ResultadoRequestDTO dto);
}