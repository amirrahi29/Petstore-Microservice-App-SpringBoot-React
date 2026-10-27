package com.petstore.pet.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class EntraJwtAuthenticator {

    private final JwtDecoder entraJwtDecoder;
    private final String clientId;

    public EntraJwtAuthenticator(
            JwtDecoder entraJwtDecoder,
            @Value("${app.entra.client-id:}") String clientId) {
        this.entraJwtDecoder = entraJwtDecoder;
        this.clientId = clientId;
    }

    public boolean authenticate(String token) {
        if (clientId == null || clientId.isBlank()) {
            return false;
        }
        try {
            Jwt jwt = entraJwtDecoder.decode(token);
            Map<String, String> claims = profile(jwt);
            String name = claims.get("email");
            if (name == null) {
                name = text(jwt, "preferred_username");
            }
            if (name == null) {
                name = jwt.getSubject();
            }
            if (name == null) {
                return false;
            }
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    name,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER")));
            authentication.setDetails(claims);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private static Map<String, String> profile(Jwt jwt) {
        Map<String, String> claims = new LinkedHashMap<>();
        put(claims, "oid", text(jwt, "oid"));
        put(claims, "sub", jwt.getSubject());
        put(claims, "email", text(jwt, "email"));
        put(claims, "given_name", text(jwt, "given_name"));
        put(claims, "family_name", text(jwt, "family_name"));
        return claims;
    }

    private static void put(Map<String, String> claims, String name, String value) {
        if (value != null) {
            claims.put(name, value);
        }
    }

    private static String text(Jwt jwt, String name) {
        Object value = jwt.getClaims().get(name);
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        return null;
    }
}
