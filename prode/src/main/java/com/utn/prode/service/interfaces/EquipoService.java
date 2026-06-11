package com.utn.prode.service.interfaces;

import com.utn.prode.dto.request.EquipoRequestDTO;
import com.utn.prode.dto.response.EquipoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface EquipoService {
    EquipoResponseDTO crear(EquipoRequestDTO dto);

    EquipoResponseDTO actualizar(UUID id, EquipoRequestDTO dto);

    void eliminar(UUID id);

    EquipoResponseDTO buscarPorId(UUID id);

    List<EquipoResponseDTO> listarTodos();

    List<EquipoResponseDTO> buscarPorNombre(String nombre);
}