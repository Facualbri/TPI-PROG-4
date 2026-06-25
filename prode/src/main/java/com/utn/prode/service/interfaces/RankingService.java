package com.utn.prode.service.interfaces;

import com.utn.prode.dto.response.RankingResponseDTO;

import java.util.List;
import java.util.UUID;

public interface RankingService {
    List<RankingResponseDTO> rankingGlobal();

    List<RankingResponseDTO> rankingGrupo(UUID grupoId);

    Long obtenerPozo();
}