package com.utn.prode.controller;

import com.utn.prode.dto.request.PartidoRequestDTO;
import com.utn.prode.dto.request.ResultadoRequestDTO;
import com.utn.prode.dto.response.PartidoResponseDTO;
import com.utn.prode.service.interfaces.PartidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/partidos")
@RequiredArgsConstructor
public class PartidoController {

    private final PartidoService partidoService;

    // GET /api/partidos?fechaId=xxx — RF4.4: listar por fecha ordenados cronológicamente
    @GetMapping
    public ResponseEntity<List<PartidoResponseDTO>> listar(
            @RequestParam UUID fechaId) {
        return ResponseEntity.ok(partidoService.listarPorFecha(fechaId));
    }

    // GET /api/partidos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PartidoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(partidoService.buscarPorId(id));
    }

    // POST /api/partidos — solo ADMIN
    @PostMapping
    public ResponseEntity<PartidoResponseDTO> crear(@Valid @RequestBody PartidoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partidoService.crear(dto));
    }

    // PUT /api/partidos/{id} — solo ADMIN — RF4.2: reprogramar horario o cambiar equipos
    @PutMapping("/{id}")
    public ResponseEntity<PartidoResponseDTO> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PartidoRequestDTO dto) {
        return ResponseEntity.ok(partidoService.actualizar(id, dto));
    }

    // DELETE /api/partidos/{id} — solo ADMIN — RF4.5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        partidoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/partidos/{id}/en-juego — solo ADMIN — RF4.3
    @PatchMapping("/{id}/en-juego")
    public ResponseEntity<PartidoResponseDTO> pasarAEnJuego(@PathVariable UUID id) {
        return ResponseEntity.ok(partidoService.pasarAEnJuego(id));
    }

    // PATCH /api/partidos/{id}/resultado — solo ADMIN — RF6.1
    @PatchMapping("/{id}/resultado")
    public ResponseEntity<PartidoResponseDTO> registrarResultado(
            @PathVariable UUID id,
            @Valid @RequestBody ResultadoRequestDTO dto) {
        return ResponseEntity.ok(partidoService.registrarResultado(id, dto));
    }
}