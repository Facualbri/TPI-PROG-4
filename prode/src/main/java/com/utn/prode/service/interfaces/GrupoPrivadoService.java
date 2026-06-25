package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.GrupoPrivadoRequestDTO;
import com.utn.prode.dto.request.UnirseGrupoRequestDTO;
import com.utn.prode.dto.response.GrupoPrivadoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface GrupoPrivadoService {
    GrupoPrivadoResponseDTO crear(UUID creadorId, GrupoPrivadoRequestDTO dto);

    GrupoPrivadoResponseDTO unirse(UUID usuarioId, UnirseGrupoRequestDTO dto);

    List<GrupoPrivadoResponseDTO> listarMisGrupos(UUID usuarioId);

    GrupoPrivadoResponseDTO buscarPorId(UUID id);

    void salir(UUID usuarioId, UUID grupoId);
}