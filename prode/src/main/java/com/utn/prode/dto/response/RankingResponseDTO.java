package com.utn.prode.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RankingResponseDTO {
    private int posicion;
    private UUID usuarioId;
    private String username;
    private Long totalPuntos;
    private Long totalPlenos;
}
