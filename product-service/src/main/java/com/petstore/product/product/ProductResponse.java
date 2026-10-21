package com.petstore.product.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private String imageUrl;

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl());
    }
}
