package com.utn.prode.controller;

import com.utn.prode.dto.request.EquipoRequestDTO;
import com.utn.prode.dto.response.EquipoResponseDTO;
import com.utn.prode.service.interfaces.EquipoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    // GET /api/equipos
    @GetMapping
    public ResponseEntity<List<EquipoResponseDTO>> listar(
            @RequestParam(required = false) String nombre) {
        if (nombre != null && !nombre.isBlank()) {
            return ResponseEntity.ok(equipoService.buscarPorNombre(nombre));
        }
        return ResponseEntity.ok(equipoService.listarTodos());
    }

    // GET /api/equipos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(equipoService.buscarPorId(id));
    }

    // POST /api/equipos — solo ADMIN (definido en SecurityConfig)
    @PostMapping
    public ResponseEntity<EquipoResponseDTO> crear(@Valid @RequestBody EquipoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoService.crear(dto));
    }

    // PUT /api/equipos/{id} — solo ADMIN
    @PutMapping("/{id}")
    public ResponseEntity<EquipoResponseDTO> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EquipoRequestDTO dto) {
        return ResponseEntity.ok(equipoService.actualizar(id, dto));
    }

    // DELETE /api/equipos/{id} — solo ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        equipoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}