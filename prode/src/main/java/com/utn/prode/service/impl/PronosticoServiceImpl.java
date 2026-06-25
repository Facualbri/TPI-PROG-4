package com.utn.prode.service.impl;

import com.utn.prode.dto.request.PronosticoRequestDTO;
import com.utn.prode.dto.response.PronosticoResponseDTO;
import com.utn.prode.entity.*;
import com.utn.prode.mapper.PronosticoMapper;
import com.utn.prode.repository.PartidoRepository;
import com.utn.prode.repository.PronosticoRepository;
import com.utn.prode.repository.UsuarioRepository;
import com.utn.prode.service.interfaces.PronosticoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class PronosticoServiceImpl implements PronosticoService {

    private final PronosticoRepository pronosticoRepository;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PronosticoMapper pronosticoMapper;

    @Override
    @Transactional
    public PronosticoResponseDTO guardar(UUID usuarioId, PronosticoRequestDTO dto) {
        Partido partido = partidoRepository.findById(dto.getPartidoId())
                .orElseThrow(() -> new NoSuchElementException("Partido no encontrado: " + dto.getPartidoId()));

        // RF5.1: el partido debe estar POR_JUGARSE
        if (partido.getEstado() != EstadoPartido.POR_JUGARSE) {
            throw new IllegalArgumentException(
                "No se puede pronosticar: el partido no está en estado POR_JUGARSE"
            );
        }

        // RF1: verificar que no se pasó la ventana de 30 minutos (bloqueo)
        if (partido.estaBloqueado()) {
            throw new IllegalArgumentException(
                "No se puede pronosticar: el partido comienza en menos de 30 minutos"
            );
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        // RF5.1: upsert — si ya existe el pronóstico, lo modifica; si no, lo crea
        Pronostico pronostico = pronosticoRepository
                .findByUsuarioIdAndPartidoId(usuarioId, dto.getPartidoId())
                .orElse(Pronostico.builder()
                        .usuario(usuario)
                        .partido(partido)
                        .build());

        pronostico.setGolesLocalPred(dto.getGolesLocalPred());
        pronostico.setGolesVisitantePred(dto.getGolesVisitantePred());

        return pronosticoMapper.toResponse(pronosticoRepository.save(pronostico));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PronosticoResponseDTO> listarPropios(UUID usuarioId) {
        return pronosticoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(pronosticoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PronosticoResponseDTO> listarPropiosPorEstado(UUID usuarioId, EstadoPartido estado) {
        return pronosticoRepository.findByUsuarioIdAndEstadoPartido(usuarioId, estado)
                .stream()
                .map(pronosticoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PronosticoResponseDTO> recientesAcertados() {
        return pronosticoRepository.findRecientesAcertados(PageRequest.of(0, 10))
                .stream()
                .map(pronosticoMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PronosticoResponseDTO> listarDeTerceros(UUID usuarioSolicitanteId, UUID partidoId) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new NoSuchElementException("Partido no encontrado: " + partidoId));

        // RF5.3: solo se pueden ver los pronósticos ajenos si ya pasó el bloqueo
        if (!partido.estaBloqueado()) {
            throw new IllegalArgumentException(
                "No se pueden consultar pronósticos de terceros: " +
                "el partido todavía no alcanzó el margen de bloqueo"
            );
        }

        return pronosticoRepository
                .findByPartidoIdExcluyendoUsuario(partidoId, usuarioSolicitanteId)
                .stream()
                .map(pronosticoMapper::toResponse)
                .toList();
    }
}