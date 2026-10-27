package com.petstore.reserver.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class LogicAppEmailNotifier {

    private static final Logger log = LoggerFactory.getLogger(LogicAppEmailNotifier.class);

    private final RestClient http = RestClient.create();
    private final String logicAppUrl;

    public LogicAppEmailNotifier(@Value("${app.notification.logic-app-url:}") String logicAppUrl) {
        this.logicAppUrl = logicAppUrl == null ? "" : logicAppUrl.trim();
    }

    public void notifyFailure(String messageBody, String reason) {
        if (logicAppUrl.isBlank()) {
            log.warn("Logic App email endpoint is not configured. Reservation failure was not emailed.");
            return;
        }
        try {
            http.post()
                    .uri(logicAppUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "subject", "Order item reservation failed",
                            "message", messageBody == null ? "" : messageBody,
                            "reason", reason == null ? "" : reason))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Sent reservation failure to the Logic App email endpoint");
        } catch (RuntimeException ex) {
            log.warn("Logic App email notification failed: {}", ex.getMessage());
        }
    }
}
