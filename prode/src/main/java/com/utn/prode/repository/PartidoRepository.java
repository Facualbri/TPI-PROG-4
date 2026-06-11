package com.utn.prode.repository;

import com.utn.prode.entity.EstadoPartido;
import com.utn.prode.entity.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, UUID> {

        // RF4.4: listar partidos de una fecha ordenados cronológicamente
        List<Partido> findByFechaIdOrderByInicioUtcAsc(UUID fechaId);

        List<Partido> findByEstado(EstadoPartido estado);

        Optional<Partido> findByApiExternalId(String apiExternalId);

        boolean existsByApiExternalId(String apiExternalId);

        /**
         * RF4.5: un partido solo se elimina si está POR_JUGARSE y sin pronósticos.
         */
        @Query("""
                        SELECT COUNT(pr) > 0
                        FROM Pronostico pr
                        WHERE pr.partido.id = :partidoId
                        """)
        boolean tienePronosticos(UUID partidoId);

        /**
         * Scheduler EnJuegoJob: busca partidos EN_JUEGO para consultar resultados.
         */
        List<Partido> findByEstadoAndInicioUtcBefore(EstadoPartido estado, Instant limite);

        /**
         * Scheduler PrePartidoJob: partidos POR_JUGARSE que arrancan en las próximas 2
         * horas.
         */
        @Query("""
                        SELECT p FROM Partido p
                        WHERE p.estado = 'POR_JUGARSE'
                          AND p.inicioUtc BETWEEN :desde AND :hasta
                        """)
        List<Partido> findProximosAIniciar(Instant desde, Instant hasta);
}