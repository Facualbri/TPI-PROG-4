package com.utn.prode.controller;

import com.utn.prode.dto.response.RankingResponseDTO;
import com.utn.prode.service.interfaces.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    // GET /api/ranking/global
    // RF7.1: ranking global ordenado por puntos con desempates (RF7.2)
    @GetMapping("/global")
    public ResponseEntity<List<RankingResponseDTO>> rankingGlobal() {
        return ResponseEntity.ok(rankingService.rankingGlobal());
    }

    // GET /api/ranking/grupo/{grupoId}
    // RF8.4: ranking exclusivo de los miembros de un grupo privado
    @GetMapping("/grupo/{grupoId}")
    public ResponseEntity<List<RankingResponseDTO>> rankingGrupo(@PathVariable UUID grupoId) {
        return ResponseEntity.ok(rankingService.rankingGrupo(grupoId));
    }
}