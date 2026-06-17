package com.utn.prode.mapper;

import com.utn.prode.dto.response.GrupoPrivadoResponseDTO;
import com.utn.prode.entity.GrupoPrivado;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface GrupoPrivadoMapper {

    @Mapping(target = "creadorUsername", source = "creador.username")
    @Mapping(target = "cantidadMiembros", expression = "java(grupo.getMiembros().size())")
    GrupoPrivadoResponseDTO toResponse(GrupoPrivado grupo);
}