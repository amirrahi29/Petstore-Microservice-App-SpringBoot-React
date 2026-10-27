package com.petstore.order.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.util.List;

@Configuration
public class EntraJwtConfig {

    @Bean
    JwtDecoder entraJwtDecoder(
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer,
            @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}") String jwkSetUri,
            @Value("${app.entra.client-id:}") String clientId) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        OAuth2TokenValidator<Jwt> validator = JwtValidators.createDefaultWithIssuer(issuer);
        if (clientId != null && !clientId.isBlank()) {
            validator = new DelegatingOAuth2TokenValidator<>(validator, audience(clientId));
        }
        decoder.setJwtValidator(validator);
        return decoder;
    }

    static OAuth2TokenValidator<Jwt> audience(String clientId) {
        return new JwtClaimValidator<>(JwtClaimNames.AUD, aud -> matchesClient(aud, clientId));
    }

    static boolean matchesClient(Object audience, String clientId) {
        if (audience instanceof String value) {
            return clientId.equals(value);
        }
        if (audience instanceof List<?> values) {
            return values.contains(clientId);
        }
        return false;
    }
}
