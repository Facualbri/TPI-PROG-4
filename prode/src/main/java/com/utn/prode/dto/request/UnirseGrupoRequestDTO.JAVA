package com.utn.prode.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UnirseGrupoRequestDTO {

    @NotBlank(message = "El código de invitación es obligatorio")
    private String codigoInvitacion;
}
