package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.Check;

@Entity
@Table(name = "partidos", uniqueConstraints = @UniqueConstraint(name = "uq_api_external_id", columnNames = "api_external_id"))
@Check(constraints = "equipo_local_id <> equipo_visitante_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fecha_id", nullable = false)
    private Fecha fecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_local_id", nullable = false)
    private Equipo equipoLocal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_visitante_id", nullable = false)
    private Equipo equipoVisitante;

    /**
     * Siempre UTC. Se usa como referencia para calcular el bloqueo (inicio - 30
     * min).
     */
    @Column(name = "inicio_utc", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private Instant inicioUtc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private EstadoPartido estado = EstadoPartido.POR_JUGARSE;

    @Column(name = "goles_local")
    private Integer golesLocal;

    @Column(name = "goles_visitante")
    private Integer golesVisitante;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Tendencia tendencia;

    /**
     * ID del partido en la API externa (football-data.org).
     * Clave de idempotencia para el scheduler: evita duplicados.
     */
    @Column(name = "api_external_id", unique = true)
    private String apiExternalId;

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Pronostico> pronosticos = new ArrayList<>();

    /**
     * Calcula si el partido esta bloqueado para nuevos pronosticos.
     * Regla RF1: bloqueo 30 minutos antes del inicio.
     */
    public boolean estaBloqueado() {
        return Instant.now().isAfter(inicioUtc.minusSeconds(30 * 60));
    }

    /**
     * Calcula la tendencia real al cargar el resultado.
     */
    public Tendencia calcularTendencia() {
        if (golesLocal > golesVisitante)
            return Tendencia.LOCAL;
        if (golesLocal < golesVisitante)
            return Tendencia.VISITANTE;
        return Tendencia.EMPATE;
    }
}