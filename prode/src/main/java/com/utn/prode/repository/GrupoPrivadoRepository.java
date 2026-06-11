package com.utn.prode.repository;

import com.utn.prode.entity.GrupoPrivado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GrupoPrivadoRepository extends JpaRepository<GrupoPrivado, UUID> {

    Optional<GrupoPrivado> findByCodigoInvitacion(String codigoInvitacion);

    boolean existsByCodigoInvitacion(String codigoInvitacion);
}