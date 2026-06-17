package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pronosticos", uniqueConstraints = @UniqueConstraint(name = "uq_usuario_partido", columnNames = {
        "usuario_id", "partido_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pronostico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partido_id", nullable = false)
    private Partido partido;

    @Column(name = "goles_local_pred", nullable = false)
    private Integer golesLocalPred;

    @Column(name = "goles_visitante_pred", nullable = false)
    private Integer golesVisitantePred;

    @Column(nullable = false)
    @Builder.Default
    private Integer puntos = 0;

    /**
     * Fecha original de creacion: usada para desempate en ranking (RF7.2).
     * Nunca se actualiza aunque el pronostico se modifique.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    /**
     * Se actualiza cada vez que el usuario modifica su pronostico.
     */
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    /**
     * Motor de puntuacion (RF6.3).
     * Se llama desde PartidoService al finalizar el partido.
     * - 3 puntos: resultado exacto
     * - 1 punto: tendencia correcta
     * - 0 puntos: sin acierto
     */
    public void calcularPuntos(int golesLocalReal, int golesVisitanteReal) {
        if (golesLocalPred.equals(golesLocalReal) && golesVisitantePred.equals(golesVisitanteReal)) {
            this.puntos = 3;
            return;
        }
        Tendencia tendenciaReal = calcularTendencia(golesLocalReal, golesVisitanteReal);
        Tendencia tendenciaPred = calcularTendencia(golesLocalPred, golesVisitantePred);
        this.puntos = tendenciaReal == tendenciaPred ? 1 : 0;
    }

    private Tendencia calcularTendencia(int local, int visitante) {
        if (local > visitante)
            return Tendencia.LOCAL;
        if (local < visitante)
            return Tendencia.VISITANTE;
        return Tendencia.EMPATE;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}