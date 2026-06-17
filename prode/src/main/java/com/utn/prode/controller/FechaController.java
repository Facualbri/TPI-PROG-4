package com.utn.prode.controller;

import com.utn.prode.dto.request.FechaRequestDTO;
import com.utn.prode.dto.response.FechaResponseDTO;
import com.utn.prode.entity.EstadoFecha;
import com.utn.prode.service.interfaces.FechaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fechas")
@RequiredArgsConstructor
public class FechaController {

    private final FechaService fechaService;

    // GET /api/fechas
    // GET /api/fechas?estado=PROGRAMADA
    @GetMapping
    public ResponseEntity<List<FechaResponseDTO>> listar(
            @RequestParam(required = false) EstadoFecha estado) {
        if (estado != null) {
            return ResponseEntity.ok(fechaService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(fechaService.listarTodas());
    }

    // GET /api/fechas/{id}
    @GetMapping("/{id}")
    public ResponseEntity<FechaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(fechaService.buscarPorId(id));
    }

    // POST /api/fechas — solo ADMIN
    @PostMapping
    public ResponseEntity<FechaResponseDTO> crear(@Valid @RequestBody FechaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fechaService.crear(dto));
    }

    // PUT /api/fechas/{id} — solo ADMIN
    @PutMapping("/{id}")
    public ResponseEntity<FechaResponseDTO> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody FechaRequestDTO dto) {
        return ResponseEntity.ok(fechaService.actualizar(id, dto));
    }

    // DELETE /api/fechas/{id} — solo ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        fechaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}