package com.utn.prode.service.impl;

import com.utn.prode.dto.response.RankingResponseDTO;
import com.utn.prode.repository.GrupoPrivadoRepository;
import com.utn.prode.repository.PronosticoRepository;
import com.utn.prode.service.interfaces.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final PronosticoRepository pronosticoRepository;
    private final GrupoPrivadoRepository grupoPrivadoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RankingResponseDTO> rankingGlobal() {
        // La query ya viene ordenada por puntos DESC, plenos DESC, fecha pronóstico ASC
        // (RF7.2)
        return mapearRanking(pronosticoRepository.findRankingGlobal());
    }

    @Override
    @Transactional(readOnly = true)
    public Long obtenerPozo() {
        return pronosticoRepository.findPozoTotal();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RankingResponseDTO> rankingGrupo(UUID grupoId) {
        // Verificar que el grupo existe
        if (!grupoPrivadoRepository.existsById(grupoId)) {
            throw new NoSuchElementException("Grupo no encontrado con id: " + grupoId);
        }
        return mapearRanking(pronosticoRepository.findRankingByGrupo(grupoId));
    }

    /**
     * Convierte el resultado de la query (Object[]) a DTOs de ranking.
     * Asigna el número de posición según el orden que viene de la query.
     *
     * El Object[] tiene este orden según la query JPQL:
     * [0] = usuario.id (UUID)
     * [1] = usuario.username (String)
     * [2] = SUM(puntos) (Long)
     * [3] = SUM(plenos) (Long)
     */
    private List<RankingResponseDTO> mapearRanking(List<Object[]> resultados) {
        List<RankingResponseDTO> ranking = new ArrayList<>();
        for (int i = 0; i < resultados.size(); i++) {
            Object[] fila = resultados.get(i);
            ranking.add(RankingResponseDTO.builder()
                    .posicion(i + 1)
                    .usuarioId((UUID) fila[0])
                    .username((String) fila[1])
                    .totalPuntos(((Number) fila[2]).longValue())
                    .totalPlenos(((Number) fila[3]).longValue())
                    .build());
        }
        return ranking;
    }
}