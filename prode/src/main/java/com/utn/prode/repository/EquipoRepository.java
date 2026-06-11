package com.utn.prode.repository;

import com.utn.prode.entity.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, UUID> {

    Optional<Equipo> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    List<Equipo> findByNombreContainingIgnoreCase(String nombre);

    /**
     * RF2.3: verifica si el equipo tiene partidos asociados antes de eliminar.
     * Si tiene partidos en cualquier estado, no se puede eliminar.
     */
    @Query("""
            SELECT COUNT(p) > 0
            FROM Partido p
            WHERE p.equipoLocal.id = :equipoId
               OR p.equipoVisitante.id = :equipoId
            """)
    boolean tienePartidosAsociados(UUID equipoId);
}