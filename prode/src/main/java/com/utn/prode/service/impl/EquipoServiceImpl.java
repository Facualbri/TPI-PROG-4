package com.utn.prode.service.impl;

import com.utn.prode.dto.request.EquipoRequestDTO;
import com.utn.prode.dto.response.EquipoResponseDTO;
import com.utn.prode.entity.Equipo;
import com.utn.prode.mapper.EquipoMapper;
import com.utn.prode.repository.EquipoRepository;
import com.utn.prode.service.interfaces.EquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipoServiceImpl implements EquipoService {

    private final EquipoRepository equipoRepository;
    private final EquipoMapper equipoMapper;

    @Override
    @Transactional
    public EquipoResponseDTO crear(EquipoRequestDTO dto) {
        if (equipoRepository.existsByNombre(dto.getNombre())) {
            throw new IllegalArgumentException("Ya existe un equipo con el nombre '" + dto.getNombre() + "'");
        }
        Equipo equipo = equipoMapper.toEntity(dto);
        return equipoMapper.toResponse(equipoRepository.save(equipo));
    }

    @Override
    @Transactional
    public EquipoResponseDTO actualizar(UUID id, EquipoRequestDTO dto) {
        Equipo equipo = buscarEntidad(id);
        // updateFromDto ignora campos nulos (PATCH parcial)
        equipoMapper.updateFromDto(dto, equipo);
        return equipoMapper.toResponse(equipoRepository.save(equipo));
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Equipo equipo = buscarEntidad(id);
        // RF2.3: no se puede eliminar si tiene partidos asociados
        if (equipoRepository.tienePartidosAsociados(id)) {
            throw new IllegalArgumentException(
                    "No se puede eliminar el equipo '" + equipo.getNombre() +
                            "' porque tiene partidos asociados");
        }
        equipoRepository.delete(equipo);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipoResponseDTO buscarPorId(UUID id) {
        return equipoMapper.toResponse(buscarEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipoResponseDTO> listarTodos() {
        return equipoRepository.findAll()
                .stream()
                .map(equipoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipoResponseDTO> buscarPorNombre(String nombre) {
        return equipoRepository.findByNombreContainingIgnoreCase(nombre)
                .stream()
                .map(equipoMapper::toResponse)
                .toList();
    }

    // Método privado reutilizable para buscar la entidad o lanzar 404
    private Equipo buscarEntidad(UUID id) {
        return equipoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Equipo no encontrado con id: " + id));
    }
}