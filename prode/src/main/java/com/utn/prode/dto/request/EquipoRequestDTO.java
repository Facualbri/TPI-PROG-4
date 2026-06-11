package com.utn.prode.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EquipoRequestDTO {

    @NotBlank(message = "El nombre del equipo es obligatorio")
    @Size(max = 100)
    private String nombre;

    private String escudoUrl;

    @Size(max = 60)
    private String pais;
}