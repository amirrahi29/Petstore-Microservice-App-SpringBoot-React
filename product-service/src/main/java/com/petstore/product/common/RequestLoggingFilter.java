package com.petstore.product.common;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Instant started = Instant.now();
        String method = request.getMethod();
        String path = request.getRequestURI();
        log.info("request received at {} {} {}", started, method, path);
        try {
            filterChain.doFilter(request, response);
            int status = response.getStatus();
            long durationMs = Duration.between(started, Instant.now()).toMillis();
            if (status >= 500) {
                log.error("request failed at {} {} {} status={} durationMs={}",
                        Instant.now(), method, path, status, durationMs);
            } else {
                log.info("request finished at {} {} {} status={} durationMs={}",
                        Instant.now(), method, path, status, durationMs);
            }
        } catch (ServletException | IOException | RuntimeException ex) {
            log.error("request failed at {} {} {} durationMs={}",
                    Instant.now(), method, path, Duration.between(started, Instant.now()).toMillis(), ex);
            throw ex;
        }
    }
}
