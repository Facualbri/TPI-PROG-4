package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "grupo_miembros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoMiembro {

    @EmbeddedId
    private GrupoMiembroId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("grupoId")
    @JoinColumn(name = "grupo_id")
    private GrupoPrivado grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "joined_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    // -------------------------------------------------------
    // Clave primaria compuesta embebida
    // -------------------------------------------------------
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class GrupoMiembroId implements Serializable {

        @Column(name = "grupo_id")
        private UUID grupoId;

        @Column(name = "usuario_id")
        private UUID usuarioId;
    }
}