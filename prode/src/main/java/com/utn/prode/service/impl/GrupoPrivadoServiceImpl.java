package com.utn.prode.service.impl;

import com.utn.prode.dto.request.GrupoPrivadoRequestDTO;
import com.utn.prode.dto.request.UnirseGrupoRequestDTO;
import com.utn.prode.dto.response.GrupoPrivadoResponseDTO;
import com.utn.prode.entity.GrupoMiembro;
import com.utn.prode.entity.GrupoPrivado;
import com.utn.prode.entity.Usuario;
import com.utn.prode.mapper.GrupoPrivadoMapper;
import com.utn.prode.repository.GrupoMiembroRepository;
import com.utn.prode.repository.GrupoPrivadoRepository;
import com.utn.prode.repository.UsuarioRepository;
import com.utn.prode.service.interfaces.GrupoPrivadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GrupoPrivadoServiceImpl implements GrupoPrivadoService {

    private final GrupoPrivadoRepository grupoRepository;
    private final GrupoMiembroRepository grupoMiembroRepository;
    private final UsuarioRepository usuarioRepository;
    private final GrupoPrivadoMapper grupoMapper;

    @Override
    @Transactional
    public GrupoPrivadoResponseDTO crear(UUID creadorId, GrupoPrivadoRequestDTO dto) {
        Usuario creador = usuarioRepository.findById(creadorId)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        // RF8.2: generar código único e irrepetible
        String codigo = generarCodigoUnico();

        GrupoPrivado grupo = GrupoPrivado.builder()
                .creador(creador)
                .nombre(dto.getNombre())
                .codigoInvitacion(codigo)
                .build();

        grupoRepository.save(grupo);

        // El creador se agrega automáticamente como primer miembro
        GrupoMiembro miembro = GrupoMiembro.builder()
                .id(new GrupoMiembro.GrupoMiembroId(grupo.getId(), creadorId))
                .grupo(grupo)
                .usuario(creador)
                .build();

        grupoMiembroRepository.save(miembro);

        return grupoMapper.toResponse(grupoRepository.findById(grupo.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public GrupoPrivadoResponseDTO unirse(UUID usuarioId, UnirseGrupoRequestDTO dto) {
        // RF8.3: buscar grupo por código de invitación
        GrupoPrivado grupo = grupoRepository.findByCodigoInvitacion(dto.getCodigoInvitacion())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Código de invitación inválido: " + dto.getCodigoInvitacion()));

        // Verificar que el usuario no sea ya miembro
        if (grupoMiembroRepository.existsByGrupoIdAndUsuarioId(grupo.getId(), usuarioId)) {
            throw new IllegalArgumentException("Ya sos miembro de este grupo");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        GrupoMiembro miembro = GrupoMiembro.builder()
                .id(new GrupoMiembro.GrupoMiembroId(grupo.getId(), usuarioId))
                .grupo(grupo)
                .usuario(usuario)
                .build();

        grupoMiembroRepository.save(miembro);

        return grupoMapper.toResponse(grupoRepository.findById(grupo.getId()).orElseThrow());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrupoPrivadoResponseDTO> listarMisGrupos(UUID usuarioId) {
        return grupoMiembroRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(m -> grupoMapper.toResponse(m.getGrupo()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GrupoPrivadoResponseDTO buscarPorId(UUID id) {
        return grupoMapper.toResponse(
                grupoRepository.findById(id)
                        .orElseThrow(() -> new NoSuchElementException("Grupo no encontrado con id: " + id)));
    }

    /**
     * RF8.2: genera un código alfanumérico único de 8 caracteres en mayúsculas.
     * Ejemplo: "X7K2MNP9"
     * Se verifica contra la BD para garantizar que sea irrepetible.
     */
    private String generarCodigoUnico() {
        String codigo;
        int intentos = 0;
        do {
            // Toma los primeros 8 caracteres de un UUID sin guiones, en mayúsculas
            codigo = UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase();
            intentos++;
            if (intentos > 10) {
                throw new IllegalStateException("No se pudo generar un código único de invitación");
            }
        } while (grupoRepository.existsByCodigoInvitacion(codigo));

        return codigo;
    }
}