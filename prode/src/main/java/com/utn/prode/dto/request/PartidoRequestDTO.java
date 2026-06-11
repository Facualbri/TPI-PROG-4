package com.utn.prode.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PartidoRequestDTO {

    @NotNull(message = "La fecha contenedora es obligatoria")
    private UUID fechaId;

    @NotNull(message = "El equipo local es obligatorio")
    private UUID equipoLocalId;

    @NotNull(message = "El equipo visitante es obligatorio")
    private UUID equipoVisitanteId;

    @NotNull(message = "El inicio del partido es obligatorio")
    private Instant inicioUtc;
}