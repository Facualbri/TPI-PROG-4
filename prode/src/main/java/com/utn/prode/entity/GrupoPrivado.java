package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "grupos_privados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoPrivado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creador_id", nullable = false)
    private Usuario creador;

    @Column(nullable = false, length = 80)
    private String nombre;

    /**
     * Codigo alfanumerico unico generado en GrupoPrivadoServiceImpl (RF8.2).
     * Formato: 8 caracteres, ejemplo: "X7K2MNP9"
     */
    @Column(name = "codigo_invitacion", nullable = false, unique = true, length = 10)
    private String codigoInvitacion;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrupoMiembro> miembros = new ArrayList<>();
}