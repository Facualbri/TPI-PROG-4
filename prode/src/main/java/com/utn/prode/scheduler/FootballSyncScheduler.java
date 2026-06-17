package com.utn.prode.scheduler;

import com.fasterxml.jackson.databind.JsonNode;
import com.utn.prode.entity.*;
import com.utn.prode.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Scheduler con 3 jobs para sincronizar datos de football-data.org 24/7.
 *
 * JOB 1 — FixtureSyncJob: lunes 6AM UTC — importa fixture semanal
 * JOB 2 — AutoTransitionJob: cada 15 min — marca como EN_JUEGO partidos que ya arrancaron
 * JOB 3 — EnJuegoJob: cada 15 min — procesa resultados finalizados y calcula puntos
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FootballSyncScheduler {

    private final FootballApiClient apiClient;
    private final PartidoRepository partidoRepository;
    private final EquipoRepository equipoRepository;
    private final FechaRepository fechaRepository;
    private final PronosticoRepository pronosticoRepository;
    private final ApiSyncLogRepository syncLogRepository;

    private static final List<String> COMPETICIONES = Arrays.asList(
            "PL", "PD", "BL1", "SA", "FL1", "CL", "BSA"
    );

    @Scheduled(cron = "0 */5 * * * *", zone = "UTC")
    @Transactional
    public void fixtureSyncJob() {
        log.info("[FixtureSyncJob] Iniciando sincronizacion semanal de fixture...");
        int procesados = 0;
        String status = "OK";
        String errorMsg = null;

        try {
            for (String codigo : COMPETICIONES) {
                try {
                    JsonNode response = apiClient.getFixture(codigo);
                    JsonNode matches = response.get("matches");
                    if (matches == null || !matches.isArray()) continue;
                    for (JsonNode match : matches) {
                        procesados += procesarPartido(match);
                    }
                } catch (Exception e) {
                    log.warn("[FixtureSyncJob] Error en competicion {}: {}", codigo, e.getMessage());
                }
            }
            log.info("[FixtureSyncJob] Finalizado. Partidos procesados: {}", procesados);
        } catch (Exception e) {
            status = "ERROR";
            errorMsg = e.getMessage();
            log.error("[FixtureSyncJob] Error general: {}", e.getMessage());
        } finally {
            guardarLog("FIXTURE", procesados, status, errorMsg);
        }
    }

    @Scheduled(cron = "0 */15 * * * *", zone = "UTC")
    @Transactional
    public void autoTransitionJob() {
        log.info("[AutoTransitionJob] Buscando partidos que deben pasar a EN_JUEGO...");
        Instant ahora = Instant.now();
        List<Partido> paraIniciar = partidoRepository.findByEstadoAndInicioUtcBefore(EstadoPartido.POR_JUGARSE, ahora);

        if (paraIniciar.isEmpty()) {
            log.info("[AutoTransitionJob] Sin partidos para iniciar.");
            return;
        }

        int contador = 0;
        for (Partido partido : paraIniciar) {
            partido.setEstado(EstadoPartido.EN_JUEGO);
            partidoRepository.save(partido);
            Fecha fecha = partido.getFecha();
            fecha.recalcularEstado();
            fechaRepository.save(fecha);
            contador++;
        }
        log.info("[AutoTransitionJob] {} partidos iniciados automaticamente.", contador);
    }

    @Scheduled(cron = "0 */15 * * * *", zone = "UTC")
    @Transactional
    public void enJuegoJob() {
        log.info("[EnJuegoJob] Consultando resultados finalizados...");
        int procesados = 0;
        String status = "OK";
        String errorMsg = null;

        try {
            for (String codigo : COMPETICIONES) {
                try {
                    JsonNode response = apiClient.getMatchesFinalizados(codigo);
                    JsonNode matches = response.get("matches");
                    if (matches == null || !matches.isArray()) continue;
                    for (JsonNode match : matches) {
                        procesados += procesarResultado(match);
                    }
                } catch (Exception e) {
                    log.warn("[EnJuegoJob] Error en competicion {}: {}", codigo, e.getMessage());
                }
            }
            log.info("[EnJuegoJob] Finalizado. Partidos con resultado procesados: {}", procesados);
        } catch (Exception e) {
            status = "ERROR";
            errorMsg = e.getMessage();
            log.error("[EnJuegoJob] Error general: {}", e.getMessage());
        } finally {
            guardarLog("RESULTADO", procesados, status, errorMsg);
        }
    }

    private int procesarPartido(JsonNode match) {
        try {
            String externalId = match.get("id").asText();
            String estado = match.get("status").asText();
            if (!"SCHEDULED".equals(estado) && !"TIMED".equals(estado)) return 0;
            if (partidoRepository.existsByApiExternalId(externalId)) return 0;

            JsonNode homeTeam = match.get("homeTeam");
            JsonNode awayTeam = match.get("awayTeam");
            Equipo local = obtenerOCrearEquipo(homeTeam.get("id").asText(), homeTeam.get("name").asText(), homeTeam.has("crest") ? homeTeam.get("crest").asText() : null);
            Equipo visitante = obtenerOCrearEquipo(awayTeam.get("id").asText(), awayTeam.get("name").asText(), awayTeam.has("crest") ? awayTeam.get("crest").asText() : null);

            String jornada = match.has("matchday") ? "Jornada " + match.get("matchday").asText() : "Jornada General";
            Fecha fecha = obtenerOCrearFecha(jornada);
            Instant inicioUtc = Instant.parse(match.get("utcDate").asText());

            Partido partido = Partido.builder().fecha(fecha).equipoLocal(local).equipoVisitante(visitante).inicioUtc(inicioUtc).apiExternalId(externalId).build();
            partidoRepository.save(partido);
            return 1;
        } catch (Exception e) {
            log.warn("[Fixture] Error procesando partido: {}", e.getMessage());
            return 0;
        }
    }

    private int procesarResultado(JsonNode match) {
        try {
            String externalId = match.get("id").asText();
            String estado = match.get("status").asText();
            if (!"FINISHED".equals(estado)) return 0;

            Partido partido = partidoRepository.findByApiExternalId(externalId).orElse(null);
            if (partido == null) return 0;
            if (partido.getEstado() == EstadoPartido.FINALIZADO) return 0;

            JsonNode score = match.get("score");
            JsonNode fullTime = score.get("fullTime");
            int golesLocal = fullTime.get("home").asInt();
            int golesVisitante = fullTime.get("away").asInt();

            partido.setGolesLocal(golesLocal);
            partido.setGolesVisitante(golesVisitante);
            partido.setTendencia(partido.calcularTendencia());
            partido.setEstado(EstadoPartido.FINALIZADO);
            partidoRepository.save(partido);

            List<Pronostico> pronosticos = pronosticoRepository.findByPartidoId(partido.getId());
            for (Pronostico pronostico : pronosticos) {
                pronostico.calcularPuntos(golesLocal, golesVisitante);
            }
            pronosticoRepository.saveAll(pronosticos);

            Fecha fecha = partido.getFecha();
            fecha.recalcularEstado();
            fechaRepository.save(fecha);

            return 1;
        } catch (Exception e) {
            log.warn("[EnJuego] Error procesando resultado: {}", e.getMessage());
            return 0;
        }
    }

    private Equipo obtenerOCrearEquipo(String externalId, String nombre, String escudoUrl) {
        return equipoRepository.findByNombre(nombre).orElseGet(() -> {
            Equipo nuevo = Equipo.builder().nombre(nombre).escudoUrl(escudoUrl).build();
            return equipoRepository.save(nuevo);
        });
    }

    private Fecha obtenerOCrearFecha(String nombre) {
        return fechaRepository.findByNombre(nombre).orElseGet(() -> {
            Fecha nueva = Fecha.builder().nombre(nombre).build();
            return fechaRepository.save(nueva);
        });
    }

    private void guardarLog(String tipo, int procesados, String status, String errorMsg) {
        try {
            syncLogRepository.save(ApiSyncLog.builder().tipo(tipo).partidosProcesados(procesados).status(status).errorMsg(errorMsg).build());
        } catch (Exception e) {
            log.error("No se pudo guardar el log de sync: {}", e.getMessage());
        }
    }
}
