package com.petstore.order.client;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductView {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
}
