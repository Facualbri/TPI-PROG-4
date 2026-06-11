package com.utn.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "equipos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "escudo_url")
    private String escudoUrl;

    @Column(length = 60)
    private String pais;

    // No mapeamos la lista de partidos aqui para evitar carga innecesaria.
    // Se accede via queries en PartidoRepository.
}