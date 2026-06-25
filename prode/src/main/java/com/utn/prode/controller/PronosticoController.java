package com.utn.prode.controller;

import com.utn.prode.dto.request.PronosticoRequestDTO;
import com.utn.prode.dto.response.PronosticoResponseDTO;
import com.utn.prode.entity.EstadoPartido;
import com.utn.prode.security.UsuarioContextService;
import com.utn.prode.service.interfaces.PronosticoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pronosticos")
@RequiredArgsConstructor
public class PronosticoController {

    private final PronosticoService pronosticoService;
    private final UsuarioContextService usuarioContextService;

    // POST /api/pronosticos
    // RF5.1: crea o modifica el pronóstico del usuario autenticado
    // El usuarioId se obtiene del token JWT, no del body
    @PostMapping
    public ResponseEntity<PronosticoResponseDTO> guardar(
            @Valid @RequestBody PronosticoRequestDTO dto) {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.ok(pronosticoService.guardar(usuarioId, dto));
    }

    // GET /api/pronosticos/mis-pronosticos
    // RF5.2: todos los pronósticos propios
    @GetMapping("/mis-pronosticos")
    public ResponseEntity<List<PronosticoResponseDTO>> listarPropios() {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.ok(pronosticoService.listarPropios(usuarioId));
    }

    // GET /api/pronosticos/mis-pronosticos?estado=FINALIZADO
    // RF5.2: pronósticos propios filtrados por estado del partido
    @GetMapping("/mis-pronosticos/filtrar")
    public ResponseEntity<List<PronosticoResponseDTO>> listarPropiosPorEstado(
            @RequestParam EstadoPartido estado) {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.ok(pronosticoService.listarPropiosPorEstado(usuarioId, estado));
    }

    // GET /api/pronosticos/recientes-acertados
    // Dashboard: últimos 10 pronósticos con puntos
    @GetMapping("/recientes-acertados")
    public ResponseEntity<List<PronosticoResponseDTO>> recientesAcertados() {
        return ResponseEntity.ok(pronosticoService.recientesAcertados());
    }

    // GET /api/pronosticos/partido/{partidoId}
    // RF5.3: pronósticos de terceros — solo si ya venció el margen de bloqueo
    @GetMapping("/partido/{partidoId}")
    public ResponseEntity<List<PronosticoResponseDTO>> listarDeTerceros(
            @PathVariable UUID partidoId) {
        UUID usuarioId = usuarioContextService.getUsuarioAutenticado().getId();
        return ResponseEntity.ok(pronosticoService.listarDeTerceros(usuarioId, partidoId));
    }
}