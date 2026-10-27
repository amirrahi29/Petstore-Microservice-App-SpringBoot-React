package com.intra.id;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Controller
public class EntraSignInController {

    private static final Logger log = LoggerFactory.getLogger(EntraSignInController.class);
    static final String VERIFIER = "entra-code-verifier";
    static final String SIGNED_IN = "entra-signed-in";

    private final ObjectMapper json;
    private final RestClient http = RestClient.builder().requestFactory(new JdkClientHttpRequestFactory()).build();
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String frontendUrl;
    private final String authorizeUrl;
    private final String tokenUrl;

    public EntraSignInController(
            ObjectMapper json,
            @Value("${app.entra.client-id}") String clientId,
            @Value("${app.entra.client-secret:}") String clientSecret,
            @Value("${app.entra.redirect-uri}") String redirectUri,
            @Value("${app.entra.frontend-url}") String frontendUrl,
            @Value("${app.entra.issuer-uri}") String issuer) {
        this.json = json;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.frontendUrl = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
        String authority = issuer.endsWith("/v2.0") ? issuer.substring(0, issuer.length() - "/v2.0".length()) : issuer;
        this.authorizeUrl = authority + "/oauth2/v2.0/authorize";
        this.tokenUrl = authority + "/oauth2/v2.0/token";
        if (clientSecret == null || clientSecret.isBlank() || clientSecret.equals(clientId)) {
            log.warn("Entra client secret is not loaded");
        } else {
            log.info("Entra client secret loaded");
        }
    }

    @GetMapping("/login/entra")
    public void login(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String verifier = verifier();
        request.getSession(true).setAttribute(VERIFIER, verifier);
        response.sendRedirect(authorizeUrl
                + "?client_id=" + enc(clientId)
                + "&response_type=code"
                + "&redirect_uri=" + enc(redirectUri)
                + "&scope=" + enc("openid profile email")
                + "&response_mode=query"
                + "&code_challenge=" + enc(challenge(verifier))
                + "&code_challenge_method=S256"
                + "&prompt=login"
                + "&p=signupsignin");
    }

    @GetMapping("/")
    public void callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(name = "error_description", required = false) String description,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        if (code == null || code.isBlank()) {
            if (error != null) {
                response.setStatus(400);
                response.setContentType("text/plain");
                response.getWriter().write(error + " " + description);
                return;
            }
            response.sendRedirect(frontendUrl);
            return;
        }
        HttpSession session = request.getSession(false);
        String verifier = session == null ? null : (String) session.getAttribute(VERIFIER);
        if (verifier == null) {
            response.setStatus(400);
            response.setContentType("text/plain");
            response.getWriter().write("Sign-in session expired. Open the app and try again.");
            return;
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", redirectUri);
        form.add("code_verifier", verifier);
        form.add("scope", "openid profile email");
        if (clientSecret != null && !clientSecret.isBlank() && !clientSecret.equals(clientId)) {
            form.add("client_secret", clientSecret);
        }
        String body;
        try {
            body = http.post().uri(tokenUrl).contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form)
                    .retrieve().body(String.class);
        } catch (RestClientResponseException ex) {
            response.setStatus(502);
            response.setContentType("text/plain");
            response.getWriter().write(ex.getResponseBodyAsString());
            return;
        }
        JsonNode token = json.readTree(body);
        if (token.path("id_token").asText("").isBlank()) {
            response.setStatus(401);
            response.setContentType("text/plain");
            response.getWriter().write("Entra token was rejected");
            return;
        }
        request.getSession(true).setAttribute(SIGNED_IN, Boolean.TRUE);
        response.sendRedirect(frontendUrl);
    }

    @GetMapping("/api/entra/items")
    @ResponseBody
    public List<Map<String, String>> items(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !Boolean.TRUE.equals(session.getAttribute(SIGNED_IN))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return List.of(
                Map.of("name", "Collar", "value", "12"),
                Map.of("name", "Leash", "value", "8"),
                Map.of("name", "Bowl", "value", "5"));
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) throws Exception {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        response.sendRedirect(frontendUrl);
    }

    private static String verifier() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String challenge(String verifier) throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }

    private static String enc(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
