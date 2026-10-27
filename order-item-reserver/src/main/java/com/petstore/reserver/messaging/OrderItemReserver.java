package com.petstore.reserver.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OrderItemReserver {

    private static final Logger log = LoggerFactory.getLogger(OrderItemReserver.class);

    public void reserve(OrderItemReservation item) {
        log.info("Reservation placeholder for order {} product {} ({}) quantity {}",
                item.orderId(), item.productId(), item.productName(), item.quantity());
    }
}
