package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.PronosticoRequestDTO;
import com.utn.prode.dto.response.PronosticoResponseDTO;
import com.utn.prode.entity.EstadoPartido;

import java.util.List;
import java.util.UUID;

public interface PronosticoService {
    PronosticoResponseDTO guardar(UUID usuarioId, PronosticoRequestDTO dto);

    List<PronosticoResponseDTO> listarPropios(UUID usuarioId);

    List<PronosticoResponseDTO> listarPropiosPorEstado(UUID usuarioId, EstadoPartido estado);

    List<PronosticoResponseDTO> listarDeTerceros(UUID usuarioSolicitanteId, UUID partidoId);
}