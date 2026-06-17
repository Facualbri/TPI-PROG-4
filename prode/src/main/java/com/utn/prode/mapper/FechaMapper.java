package com.utn.prode.mapper;

import com.utn.prode.dto.request.FechaRequestDTO;
import com.utn.prode.dto.response.FechaResponseDTO;
import com.utn.prode.entity.Fecha;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface FechaMapper {

    @Mapping(target = "estado", expression = "java(fecha.getEstado().name())")
    FechaResponseDTO toResponse(Fecha fecha);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "partidos", ignore = true)
    Fecha toEntity(FechaRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "partidos", ignore = true)
    void updateFromDto(FechaRequestDTO dto, @MappingTarget Fecha fecha);
}