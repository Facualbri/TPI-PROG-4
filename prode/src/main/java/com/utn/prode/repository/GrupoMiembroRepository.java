package com.utn.prode.repository;

import com.utn.prode.entity.GrupoMiembro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GrupoMiembroRepository extends JpaRepository<GrupoMiembro, GrupoMiembro.GrupoMiembroId> {

    List<GrupoMiembro> findByGrupoId(UUID grupoId);

    List<GrupoMiembro> findByUsuarioId(UUID usuarioId);

    boolean existsByGrupoIdAndUsuarioId(UUID grupoId, UUID usuarioId);

    long countByGrupoId(UUID grupoId);

    @Modifying
    @Query("DELETE FROM GrupoMiembro gm WHERE gm.id.grupoId = :grupoId AND gm.id.usuarioId = :usuarioId")
    void deleteByGrupoAndUsuario(@Param("grupoId") UUID grupoId, @Param("usuarioId") UUID usuarioId);
}