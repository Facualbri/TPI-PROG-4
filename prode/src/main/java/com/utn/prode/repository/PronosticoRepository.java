package com.utn.prode.repository;

import com.utn.prode.entity.EstadoPartido;
import com.utn.prode.entity.Pronostico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

@Repository
public interface PronosticoRepository extends JpaRepository<Pronostico, UUID> {

       // RF5.1: busca pronóstico existente para hacer upsert
       Optional<Pronostico> findByUsuarioIdAndPartidoId(UUID usuarioId, UUID partidoId);

       // RF5.2: pronósticos propios filtrados por estado del partido
       @Query("""
                     SELECT pr FROM Pronostico pr
                     JOIN FETCH pr.partido p
                     JOIN FETCH p.equipoLocal
                     JOIN FETCH p.equipoVisitante
                     WHERE pr.usuario.id = :usuarioId
                     AND p.estado = :estadoPartido
                     ORDER BY p.inicioUtc ASC
                     """)
       List<Pronostico> findByUsuarioIdAndEstadoPartido(
                     @Param("usuarioId") UUID usuarioId,
                     @Param("estadoPartido") EstadoPartido estadoPartido);

       // RF5.2: todos los pronósticos del usuario
       @Query("""
                     SELECT pr FROM Pronostico pr
                     JOIN FETCH pr.partido p
                     JOIN FETCH p.equipoLocal
                     JOIN FETCH p.equipoVisitante
                     WHERE pr.usuario.id = :usuarioId
                     ORDER BY p.inicioUtc ASC
                     """)
       List<Pronostico> findByUsuarioId(@Param("usuarioId") UUID usuarioId);

       // RF5.3: pronósticos de terceros (solo si el partido ya está bloqueado)
       @Query("""
                     SELECT pr FROM Pronostico pr
                     JOIN FETCH pr.usuario u
                     WHERE pr.partido.id = :partidoId
                     AND pr.usuario.id <> :usuarioSolicitanteId
                     """)
       List<Pronostico> findByPartidoIdExcluyendoUsuario(
                     @Param("partidoId") UUID partidoId,
                     @Param("usuarioSolicitanteId") UUID usuarioSolicitanteId);

       // RF6.3: todos los pronósticos de un partido para el motor de puntuación
        List<Pronostico> findByPartidoId(UUID partidoId);

        // Dashboard: últimos 10 pronósticos con puntos (más recientes primero)
        @Query("""
                      SELECT pr FROM Pronostico pr
                      JOIN FETCH pr.partido p
                      JOIN FETCH p.equipoLocal
                      JOIN FETCH p.equipoVisitante
                      WHERE pr.puntos > 0
                      ORDER BY pr.updatedAt DESC
                      """)
        List<Pronostico> findRecientesAcertados(Pageable pageable);

        // Dashboard: pozo total de puntos de todos los usuarios
        @Query("SELECT COALESCE(SUM(pr.puntos), 0) FROM Pronostico pr")
        Long findPozoTotal();

       // RF7.1 y RF7.2: ranking global con desempates
       @Query("""
                     SELECT pr.usuario.id,
                            pr.usuario.username,
                            SUM(pr.puntos) AS totalPuntos,
                            SUM(CASE WHEN pr.puntos = 3 THEN 1 ELSE 0 END) AS totalPlenos,
                            MIN(pr.createdAt) AS primerPronostico
                     FROM Pronostico pr
                     GROUP BY pr.usuario.id, pr.usuario.username
                     ORDER BY totalPuntos DESC,
                              totalPlenos DESC,
                              primerPronostico ASC
                     """)
       List<Object[]> findRankingGlobal();

       // RF8.4: ranking de un grupo privado
       @Query("""
                     SELECT pr.usuario.id,
                            pr.usuario.username,
                            SUM(pr.puntos) AS totalPuntos,
                            SUM(CASE WHEN pr.puntos = 3 THEN 1 ELSE 0 END) AS totalPlenos,
                            MIN(pr.createdAt) AS primerPronostico
                     FROM Pronostico pr
                     WHERE pr.usuario.id IN (
                         SELECT gm.usuario.id
                         FROM GrupoMiembro gm
                         WHERE gm.grupo.id = :grupoId
                     )
                     GROUP BY pr.usuario.id, pr.usuario.username
                     ORDER BY totalPuntos DESC,
                              totalPlenos DESC,
                              primerPronostico ASC
                     """)
       List<Object[]> findRankingByGrupo(@Param("grupoId") UUID grupoId);
}