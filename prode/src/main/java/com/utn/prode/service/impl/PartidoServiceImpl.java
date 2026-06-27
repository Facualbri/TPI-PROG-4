package com.utn.prode.service.impl;

import com.utn.prode.dto.request.PartidoRequestDTO;
import com.utn.prode.dto.request.ResultadoRequestDTO;
import com.utn.prode.dto.response.PartidoResponseDTO;
import com.utn.prode.entity.*;
import com.utn.prode.mapper.PartidoMapper;
import com.utn.prode.repository.*;
import com.utn.prode.service.interfaces.PartidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartidoServiceImpl implements PartidoService {

    private final PartidoRepository partidoRepository;
    private final FechaRepository fechaRepository;
    private final EquipoRepository equipoRepository;
    private final PronosticoRepository pronosticoRepository;
    private final PartidoMapper partidoMapper;

    @Override
    @Transactional
    public PartidoResponseDTO crear(PartidoRequestDTO dto) {
        // RF4.1: los dos equipos deben ser distintos
        if (dto.getEquipoLocalId().equals(dto.getEquipoVisitanteId())) {
            throw new IllegalArgumentException("El equipo local y visitante no pueden ser el mismo");
        }

        Fecha fecha = fechaRepository.findById(dto.getFechaId())
                .orElseThrow(() -> new NoSuchElementException("Fecha no encontrada: " + dto.getFechaId()));

        Equipo local = equipoRepository.findById(dto.getEquipoLocalId())
                .orElseThrow(() -> new NoSuchElementException("Equipo local no encontrado"));

        Equipo visitante = equipoRepository.findById(dto.getEquipoVisitanteId())
                .orElseThrow(() -> new NoSuchElementException("Equipo visitante no encontrado"));

        Partido partido = Partido.builder()
                .fecha(fecha)
                .equipoLocal(local)
                .equipoVisitante(visitante)
                .inicioUtc(dto.getInicioUtc())
                .build(); // estado = POR_JUGARSE por defecto

        return partidoMapper.toResponse(partidoRepository.save(partido));
    }

    @Override
    @Transactional
    public PartidoResponseDTO actualizar(UUID id, PartidoRequestDTO dto) {
        Partido partido = buscarEntidad(id);

        // RF4.2: solo se puede modificar si está POR_JUGARSE
        if (partido.getEstado() != EstadoPartido.POR_JUGARSE) {
            throw new IllegalArgumentException(
                    "No se puede modificar el partido porque su estado es: " + partido.getEstado());
        }

        // RF4.1: validar equipos distintos
        if (dto.getEquipoLocalId().equals(dto.getEquipoVisitanteId())) {
            throw new IllegalArgumentException("El equipo local y visitante no pueden ser el mismo");
        }

        Equipo local = equipoRepository.findById(dto.getEquipoLocalId())
                .orElseThrow(() -> new NoSuchElementException("Equipo local no encontrado"));

        Equipo visitante = equipoRepository.findById(dto.getEquipoVisitanteId())
                .orElseThrow(() -> new NoSuchElementException("Equipo visitante no encontrado"));

        partido.setEquipoLocal(local);
        partido.setEquipoVisitante(visitante);
        partido.setInicioUtc(dto.getInicioUtc());

        return partidoMapper.toResponse(partidoRepository.save(partido));
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Partido partido = buscarEntidad(id);

        // RF4.5: solo si está POR_JUGARSE
        if (partido.getEstado() != EstadoPartido.POR_JUGARSE) {
            throw new IllegalArgumentException(
                    "No se puede eliminar el partido porque su estado es: " + partido.getEstado());
        }

        // RF4.5: solo si no tiene pronósticos
        if (partidoRepository.tienePronosticos(id)) {
            throw new IllegalArgumentException(
                    "No se puede eliminar el partido porque tiene pronósticos registrados");
        }

        partidoRepository.delete(partido);
    }

    @Override
    @Transactional(readOnly = true)
    public PartidoResponseDTO buscarPorId(UUID id) {
        return partidoMapper.toResponse(buscarEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartidoResponseDTO> listarPorFecha(UUID fechaId) {
        // RF4.4: ordenados cronológicamente
        return partidoRepository.findByFechaIdOrderByInicioUtcAsc(fechaId)
                .stream()
                .map(partidoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PartidoResponseDTO pasarAEnJuego(UUID id) {
        Partido partido = buscarEntidad(id);

        // RF4.3: solo se puede pasar a EN_JUEGO si está POR_JUGARSE
        if (partido.getEstado() != EstadoPartido.POR_JUGARSE) {
            throw new IllegalArgumentException(
                    "El partido no puede pasar a EN_JUEGO porque su estado actual es: " + partido.getEstado());
        }

        partido.setEstado(EstadoPartido.EN_JUEGO);
        partidoRepository.save(partido);

        // RF3.3: recalcular el estado de la Fecha contenedora
        Fecha fecha = partido.getFecha();
        fecha.recalcularEstado();
        fechaRepository.save(fecha);

        return partidoMapper.toResponse(partido);
    }

    @Override
    @Transactional
    public PartidoResponseDTO registrarResultado(UUID id, ResultadoRequestDTO dto) {
        Partido partido = buscarEntidad(id);

        // RF6.1: solo se puede cargar resultado si el partido está EN_JUEGO
        if (partido.getEstado() != EstadoPartido.EN_JUEGO) {
            throw new IllegalArgumentException(
                    "Solo se puede registrar resultado de un partido EN_JUEGO. Estado actual: " + partido.getEstado());
        }

        // Guardar los goles reales y calcular la tendencia (RF6.2)
        partido.setGolesLocal(dto.getGolesLocal());
        partido.setGolesVisitante(dto.getGolesVisitante());
        partido.setTendencia(partido.calcularTendencia());

        // RF6.3: cambiar estado del partido a FINALIZADO
        partido.setEstado(EstadoPartido.FINALIZADO);
        partidoRepository.save(partido);

        // RF6.3: ejecutar motor de puntuación para todos los pronósticos del partido
        List<Pronostico> pronosticos = pronosticoRepository.findByPartidoId(id);
        for (Pronostico pronostico : pronosticos) {
            pronostico.calcularPuntos(dto.getGolesLocal(), dto.getGolesVisitante());
        }
        pronosticoRepository.saveAll(pronosticos);

        // RF3.3: recalcular estado de la Fecha contenedora
        Fecha fecha = partido.getFecha();
        fecha.recalcularEstado();
        fechaRepository.save(fecha);

        return partidoMapper.toResponse(partido);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartidoResponseDTO> listarProximos(int limite) {
        return partidoRepository.findByEstadoOrderByInicioUtcAsc(EstadoPartido.POR_JUGARSE)
                .stream()
                .limit(limite)
                .map(partidoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public int transicionarPendientes() {
        Instant ahora = Instant.now();
        List<Partido> pendientes = partidoRepository.findByEstadoAndInicioUtcBefore(
                EstadoPartido.POR_JUGARSE, ahora);

        for (Partido partido : pendientes) {
            partido.setEstado(EstadoPartido.EN_JUEGO);
            partidoRepository.save(partido);
            Fecha fecha = partido.getFecha();
            fecha.recalcularEstado();
            fechaRepository.save(fecha);
        }

        return pendientes.size();
    }

    private Partido buscarEntidad(UUID id) {
        return partidoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Partido no encontrado con id: " + id));
    }
}