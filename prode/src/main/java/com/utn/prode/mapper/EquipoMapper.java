package com.utn.prode.mapper;

import com.utn.prode.dto.request.EquipoRequestDTO;
import com.utn.prode.dto.response.EquipoResponseDTO;
import com.utn.prode.entity.Equipo;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EquipoMapper {

    EquipoResponseDTO toResponse(Equipo equipo);

    Equipo toEntity(EquipoRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDto(EquipoRequestDTO dto, @MappingTarget Equipo equipo);
}