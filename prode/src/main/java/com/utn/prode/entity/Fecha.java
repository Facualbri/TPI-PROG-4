package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "fechas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fecha {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private EstadoFecha estado = EstadoFecha.PROGRAMADA;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "fecha", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Partido> partidos = new ArrayList<>();

    /**
     * Recalcula el estado de la Fecha segun el estado de sus partidos.
     * Llamar cada vez que un Partido cambia de estado.
     * Reglas RF3.3:
     * - PROGRAMADA: todos POR_JUGARSE (o lista vacia)
     * - EN_JUEGO: al menos uno EN_JUEGO
     * - FINALIZADA: todos FINALIZADO
     */
    public void recalcularEstado() {
        if (partidos.isEmpty()) {
            this.estado = EstadoFecha.PROGRAMADA;
            return;
        }
        boolean todosFinalizados = partidos.stream()
                .allMatch(p -> p.getEstado() == EstadoPartido.FINALIZADO);
        boolean algunoEnJuego = partidos.stream()
                .anyMatch(p -> p.getEstado() == EstadoPartido.EN_JUEGO);

        if (todosFinalizados) {
            this.estado = EstadoFecha.FINALIZADA;
        } else if (algunoEnJuego) {
            this.estado = EstadoFecha.EN_JUEGO;
        } else {
            this.estado = EstadoFecha.PROGRAMADA;
        }
    }
}