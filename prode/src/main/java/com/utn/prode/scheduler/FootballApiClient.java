package com.utn.prode.scheduler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Component
@RequiredArgsConstructor
@Slf4j
public class FootballApiClient {

    @Value("${football.api.base-url}")
    private String baseUrl;

    @Value("${football.api.token}")
    private String token;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public JsonNode getFixture(String competitionCode) throws Exception {
        String url = baseUrl + "/competitions/" + competitionCode + "/matches?status=SCHEDULED";
        return get(url);
    }

    public JsonNode getMatchesFinalizados(String competitionCode) throws Exception {
        String hoy = LocalDate.now(ZoneOffset.UTC).toString();
        String dateFrom = LocalDate.now(ZoneOffset.UTC).minusDays(3).toString();
        String url = baseUrl + "/competitions/" + competitionCode
                + "/matches?status=FINISHED&dateFrom=" + dateFrom + "&dateTo=" + hoy;
        return get(url);
    }

    private JsonNode get(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("X-Auth-Token", token)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Error en API football-data.org: HTTP " +
                    response.statusCode() + " - " + response.body());
        }

        return objectMapper.readTree(response.body());
    }
}
