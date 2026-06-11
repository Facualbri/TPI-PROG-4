package com.utn.prode.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoPrivadoResponseDTO {
    private UUID id;
    private String nombre;
    private String codigoInvitacion;
    private String creadorUsername;
    private int cantidadMiembros;
}