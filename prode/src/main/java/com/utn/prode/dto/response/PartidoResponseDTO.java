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
public class PartidoResponseDTO {
    private UUID id;
    private UUID fechaId;
    private String fechaNombre;
    private EquipoResponseDTO equipoLocal;
    private EquipoResponseDTO equipoVisitante;
    private Instant inicioUtc;
    private String estado;
    private Integer golesLocal;
    private Integer golesVisitante;
    private String tendencia;
    private boolean bloqueado;
}