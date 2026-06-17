package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.FechaRequestDTO;
import com.utn.prode.dto.response.FechaResponseDTO;
import com.utn.prode.entity.EstadoFecha;

import java.util.List;
import java.util.UUID;

public interface FechaService {
    FechaResponseDTO crear(FechaRequestDTO dto);

    FechaResponseDTO actualizar(UUID id, FechaRequestDTO dto);

    void eliminar(UUID id);

    FechaResponseDTO buscarPorId(UUID id);

    List<FechaResponseDTO> listarTodas();

    List<FechaResponseDTO> listarPorEstado(EstadoFecha estado);
}