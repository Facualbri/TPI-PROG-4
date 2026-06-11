package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_sync_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String tipo; // "FIXTURE" | "RESULTADO"

    @Column(name = "ejecutado_at", nullable = false)
    @Builder.Default
    private Instant ejecutadoAt = Instant.now();

    @Column(name = "partidos_procesados")
    @Builder.Default
    private Integer partidosProcesados = 0;

    @Column(nullable = false, length = 10)
    private String status; // "OK" | "ERROR"

    @Column(name = "error_msg", columnDefinition = "TEXT")
    private String errorMsg;
}