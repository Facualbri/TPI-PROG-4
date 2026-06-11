package com.utn.prode.repository;

import com.utn.prode.entity.ApiSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApiSyncLogRepository extends JpaRepository<ApiSyncLog, UUID> {

    List<ApiSyncLog> findTop10ByOrderByEjecutadoAtDesc();
}