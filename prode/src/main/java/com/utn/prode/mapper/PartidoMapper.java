package com.utn.prode.mapper;

import com.utn.prode.dto.response.PartidoResponseDTO;
import com.utn.prode.entity.Partido;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = { EquipoMapper.class })
public interface PartidoMapper {

    @Mapping(target = "fechaId", source = "fecha.id")
    @Mapping(target = "fechaNombre", source = "fecha.nombre")
    @Mapping(target = "estado", expression = "java(partido.getEstado().name())")
    @Mapping(target = "tendencia", expression = "java(partido.getTendencia() != null ? partido.getTendencia().name() : null)")
    @Mapping(target = "bloqueado", expression = "java(partido.estaBloqueado())")
    PartidoResponseDTO toResponse(Partido partido);
}