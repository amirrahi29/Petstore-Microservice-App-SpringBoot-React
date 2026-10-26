package com.petstore.order.cart;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CartLine {

    @NotNull
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price;

    @Size(max = 500)
    private String image;

    @Size(max = 50)
    private String category;

    @Min(1)
    @Max(99)
    private int quantity;
}
