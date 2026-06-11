package com.utn.prode.repository;

import com.utn.prode.entity.GrupoMiembro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GrupoMiembroRepository extends JpaRepository<GrupoMiembro, GrupoMiembro.GrupoMiembroId> {

    List<GrupoMiembro> findByGrupoId(UUID grupoId);

    List<GrupoMiembro> findByUsuarioId(UUID usuarioId);

    boolean existsByGrupoIdAndUsuarioId(UUID grupoId, UUID usuarioId);
}