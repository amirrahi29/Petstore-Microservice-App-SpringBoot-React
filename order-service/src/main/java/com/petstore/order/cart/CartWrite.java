package com.petstore.order.cart;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CartWrite {

    @Valid
    @NotNull
    private List<CartLine> items = new ArrayList<>();
}
