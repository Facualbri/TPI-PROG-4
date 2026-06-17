package com.utn.prode.controller;

import com.utn.prode.dto.request.GrupoPrivadoRequestDTO;
import com.utn.prode.dto.request.UnirseGrupoRequestDTO;
import com.utn.prode.dto.response.GrupoPrivadoResponseDTO;
import com.utn.prode.security.UsuarioContextService;
import com.utn.prode.service.interfaces.GrupoPrivadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoPrivadoController {

    private final GrupoPrivadoService grupoService;
    private final UsuarioContextService usuarioContextService;

    // POST /api/grupos
    // RF8.1: cualquier USER puede crear un grupo con nombre personalizado
    // RF8.2: el backend genera el código de invitación automáticamente
    @PostMapping
    public ResponseEntity<GrupoPrivadoResponseDTO> crear(
            @Valid @RequestBody GrupoPrivadoRequestDTO dto) {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(grupoService.crear(usuarioId, dto));
    }

    // POST /api/grupos/unirse
    // RF8.3: un usuario se une a un grupo con el código de invitación
    @PostMapping("/unirse")
    public ResponseEntity<GrupoPrivadoResponseDTO> unirse(
            @Valid @RequestBody UnirseGrupoRequestDTO dto) {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.ok(grupoService.unirse(usuarioId, dto));
    }

    // GET /api/grupos/mis-grupos
    // Lista todos los grupos a los que pertenece el usuario autenticado
    @GetMapping("/mis-grupos")
    public ResponseEntity<List<GrupoPrivadoResponseDTO>> listarMisGrupos() {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.ok(grupoService.listarMisGrupos(usuarioId));
    }

    // GET /api/grupos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<GrupoPrivadoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(grupoService.buscarPorId(id));
    }
}