package com.petstore.product.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDocument {

    private String id;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private String image;

    static ProductDocument from(Product product) {
        ProductDocument document = new ProductDocument();
        document.setId(String.valueOf(product.getId()));
        document.setName(product.getName());
        document.setCategory(product.getCategory());
        document.setDescription(product.getDescription());
        document.setPrice(product.getPrice());
        document.setImage(product.getImageUrl());
        return document;
    }
}
