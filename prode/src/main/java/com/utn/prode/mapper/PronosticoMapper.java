package com.utn.prode.mapper;

import com.utn.prode.dto.response.PronosticoResponseDTO;
import com.utn.prode.entity.Pronostico;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = { EquipoMapper.class })
public interface PronosticoMapper {

    @Mapping(target = "partidoId", source = "partido.id")
    @Mapping(target = "equipoLocal", source = "partido.equipoLocal")
    @Mapping(target = "equipoVisitante", source = "partido.equipoVisitante")
    @Mapping(target = "inicioUtc", source = "partido.inicioUtc")
    @Mapping(target = "estadoPartido", expression = "java(pronostico.getPartido().getEstado().name())")
    @Mapping(target = "golesLocal", source = "partido.golesLocal")
    @Mapping(target = "golesVisitante", source = "partido.golesVisitante")
    @Mapping(target = "username", source = "usuario.username")
    PronosticoResponseDTO toResponse(Pronostico pronostico);
}