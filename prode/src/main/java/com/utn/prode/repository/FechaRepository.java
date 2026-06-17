package com.utn.prode.repository;

import com.utn.prode.entity.EstadoFecha;
import com.utn.prode.entity.Fecha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FechaRepository extends JpaRepository<Fecha, UUID> {

    List<Fecha> findByEstado(EstadoFecha estado);

    List<Fecha> findAllByOrderByCreatedAtAsc();

    boolean existsByNombre(String nombre);

    Optional<Fecha> findByNombre(String nombre);

    /**
     * RF3.2: una Fecha solo se puede eliminar si está PROGRAMADA y no tiene
     * partidos.
     */
    @Query("""
            SELECT COUNT(p) > 0
            FROM Partido p
            WHERE p.fecha.id = :fechaId
            """)
    boolean tienePartidos(UUID fechaId);
}