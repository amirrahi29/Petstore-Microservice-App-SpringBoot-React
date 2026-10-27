package com.petstore.order.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petstore.order.security.EntraJwtAuthenticator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Controller
public class EntraLoginController {

    private static final Logger log = LoggerFactory.getLogger(EntraLoginController.class);
    static final String VERIFIER = "entra-code-verifier";
    static final String RETURN_TO = "entra-return-to";
    static final String DEV_UI = "http://localhost:3000/";
    static final String REDIRECT_URI = "http://localhost:8083/login/oauth2/code/azure";

    private final EntraJwtAuthenticator entra;
    private final ObjectMapper json;
    private final RestClient http = RestClient.builder().requestFactory(new JdkClientHttpRequestFactory()).build();
    private final SecurityContextRepository securityContexts = new HttpSessionSecurityContextRepository();
    private final String clientId;
    private final String clientSecret;
    private final String authorizeUrl;
    private final String tokenUrl;

    public EntraLoginController(
            EntraJwtAuthenticator entra,
            ObjectMapper json,
            @Value("${app.entra.client-id}") String clientId,
            @Value("${spring.security.oauth2.client.registration.azure.client-secret:}") String clientSecret,
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer) {
        this.entra = entra;
        this.json = json;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        String authority = issuer.endsWith("/v2.0") ? issuer.substring(0, issuer.length() - "/v2.0".length()) : issuer;
        this.authorizeUrl = authority + "/oauth2/v2.0/authorize";
        this.tokenUrl = authority + "/oauth2/v2.0/token";
        if (clientSecret == null || clientSecret.isBlank()) {
            log.warn("Entra client secret is missing");
        } else if (clientSecret.equals(clientId)) {
            log.warn("Entra client secret matches the client id");
        } else {
            log.info("Entra client secret loaded");
        }
    }

    @GetMapping("/login/entra")
    public void login(
            @RequestParam(name = "return", required = false) String returnTo,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        if (DEV_UI.equals(returnTo)) {
            request.getSession(true).setAttribute(RETURN_TO, DEV_UI);
        }
        response.sendRedirect(authorizationUrl(request));
    }

    @GetMapping("/login/oauth2/code/azure")
    public void callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(name = "error_description", required = false) String description,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        if (code == null || code.isBlank()) {
            response.setStatus(400);
            response.setContentType("text/plain");
            response.getWriter().write(error == null ? "Missing authorization code" : error + " " + description);
            return;
        }
        HttpSession session = request.getSession(false);
        String verifier = session == null ? null : (String) session.getAttribute(VERIFIER);
        if (verifier == null) {
            response.setStatus(400);
            response.setContentType("text/plain");
            response.getWriter().write("Sign-in session expired. Open / and try again.");
            return;
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", REDIRECT_URI);
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
        } catch (RuntimeException ex) {
            response.setStatus(502);
            response.setContentType("text/plain");
            response.getWriter().write(ex.getClass().getSimpleName() + ": " + ex.getMessage());
            return;
        }
        JsonNode token = json.readTree(body);
        String idToken = token.path("id_token").asText("");
        if (!entra.authenticate(idToken)) {
            response.setStatus(401);
            response.setContentType("text/plain");
            response.getWriter().write("Entra token was rejected");
            return;
        }
        SecurityContext context = SecurityContextHolder.getContext();
        securityContexts.saveContext(context, request, response);
        HttpSession current = request.getSession(false);
        Object returnTo = current == null ? null : current.getAttribute(RETURN_TO);
        response.sendRedirect(DEV_UI.equals(returnTo) ? DEV_UI : "/");
    }

    private String authorizationUrl(HttpServletRequest request) throws Exception {
        String verifier = verifier();
        request.getSession(true).setAttribute(VERIFIER, verifier);
        return authorizeUrl
                + "?client_id=" + enc(clientId)
                + "&response_type=code"
                + "&redirect_uri=" + enc(REDIRECT_URI)
                + "&scope=" + enc("openid profile email")
                + "&response_mode=query"
                + "&code_challenge=" + enc(challenge(verifier))
                + "&code_challenge_method=S256"
                + "&prompt=login"
                + "&p=signupsignin";
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
