package com.petstore.order.client;

import com.petstore.order.common.BadRequestException;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class ProductClient {

    private final RestClient restClient;

    public ProductClient(RestClient productRestClient) {
        this.restClient = productRestClient;
    }

    public ProductView getProduct(Long id) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        String authorization = attributes == null ? null : attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
        try {
            return restClient.get()
                    .uri("/api/products/{id}", id)
                    .header(HttpHeaders.AUTHORIZATION, authorization == null ? "" : authorization)
                    .retrieve()
                    .body(ProductView.class);
        } catch (RestClientException ex) {
            throw new BadRequestException("Product " + id + " is not available");
        }
    }
}
