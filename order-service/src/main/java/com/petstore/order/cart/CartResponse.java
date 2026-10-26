package com.petstore.order.cart;

import lombok.Getter;

import java.util.List;

@Getter
public class CartResponse {

    private final String userId;
    private final List<CartLine> items;

    public CartResponse(String userId, List<CartLine> items) {
        this.userId = userId;
        this.items = items;
    }

    public static CartResponse from(CartDocument document) {
        List<CartLine> items = document.getItems() == null ? List.of() : List.copyOf(document.getItems());
        return new CartResponse(document.getUserId(), items);
    }
}
