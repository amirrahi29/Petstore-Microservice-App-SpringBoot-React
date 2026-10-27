package com.petstore.reserver.messaging;

public record OrderItemReservation(Long orderId, Long productId, String productName, int quantity) {
}
