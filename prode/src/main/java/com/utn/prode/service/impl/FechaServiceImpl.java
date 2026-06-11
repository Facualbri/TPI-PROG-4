package com.utn.prode.service.impl;

import com.utn.prode.dto.request.FechaRequestDTO;
import com.utn.prode.dto.response.FechaResponseDTO;
import com.utn.prode.entity.EstadoFecha;
import com.utn.prode.entity.Fecha;
import com.utn.prode.mapper.FechaMapper;
import com.utn.prode.repository.FechaRepository;
import com.utn.prode.service.interfaces.FechaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FechaServiceImpl implements FechaService {

    private final FechaRepository fechaRepository;
    private final FechaMapper fechaMapper;

    @Override
    @Transactional
    public FechaResponseDTO crear(FechaRequestDTO dto) {
        if (fechaRepository.existsByNombre(dto.getNombre())) {
            throw new IllegalArgumentException("Ya existe una fecha con el nombre '" + dto.getNombre() + "'");
        }
        Fecha fecha = fechaMapper.toEntity(dto);
        // estado = PROGRAMADA por defecto (@Builder.Default en la entidad)
        return fechaMapper.toResponse(fechaRepository.save(fecha));
    }

    @Override
    @Transactional
    public FechaResponseDTO actualizar(UUID id, FechaRequestDTO dto) {
        Fecha fecha = buscarEntidad(id);
        // RF3.2: solo se puede modificar si está PROGRAMADA
        if (fecha.getEstado() != EstadoFecha.PROGRAMADA) {
            throw new IllegalArgumentException(
                    "No se puede modificar la fecha '" + fecha.getNombre() +
                            "' porque su estado es: " + fecha.getEstado());
        }
        fechaMapper.updateFromDto(dto, fecha);
        return fechaMapper.toResponse(fechaRepository.save(fecha));
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Fecha fecha = buscarEntidad(id);
        // RF3.2: solo se puede eliminar si está PROGRAMADA y sin partidos
        if (fecha.getEstado() != EstadoFecha.PROGRAMADA) {
            throw new IllegalArgumentException(
                    "No se puede eliminar la fecha '" + fecha.getNombre() +
                            "' porque su estado es: " + fecha.getEstado());
        }
        if (fechaRepository.tienePartidos(id)) {
            throw new IllegalArgumentException(
                    "No se puede eliminar la fecha '" + fecha.getNombre() +
                            "' porque tiene partidos asociados");
        }
        fechaRepository.delete(fecha);
    }

    @Override
    @Transactional(readOnly = true)
    public FechaResponseDTO buscarPorId(UUID id) {
        return fechaMapper.toResponse(buscarEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FechaResponseDTO> listarTodas() {
        return fechaRepository.findAllByOrderByCreatedAtAsc()
                .stream()
                .map(fechaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FechaResponseDTO> listarPorEstado(EstadoFecha estado) {
        return fechaRepository.findByEstado(estado)
                .stream()
                .map(fechaMapper::toResponse)
                .toList();
    }

    private Fecha buscarEntidad(UUID id) {
        return fechaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Fecha no encontrada con id: " + id));
    }
}