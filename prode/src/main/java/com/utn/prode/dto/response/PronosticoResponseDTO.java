package com.utn.prode.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PronosticoResponseDTO {
    private UUID id;
    private UUID partidoId;
    private EquipoResponseDTO equipoLocal;
    private EquipoResponseDTO equipoVisitante;
    private Instant inicioUtc;
    private String estadoPartido;
    private Integer golesLocalPred;
    private Integer golesVisitantePred;
    private Integer puntos;
    private Instant createdAt;
}