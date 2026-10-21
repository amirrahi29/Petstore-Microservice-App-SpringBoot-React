package com.petstore.order.sale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {

    @NotEmpty
    @Valid
    private List<CheckoutItemRequest> items;
}
