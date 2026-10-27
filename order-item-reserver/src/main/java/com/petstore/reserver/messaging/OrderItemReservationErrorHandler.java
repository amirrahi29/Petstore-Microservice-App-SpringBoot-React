package com.petstore.reserver.messaging;

import com.azure.messaging.servicebus.ServiceBusErrorContext;
import com.azure.spring.cloud.service.servicebus.consumer.ServiceBusErrorHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class OrderItemReservationErrorHandler implements ServiceBusErrorHandler {

    private static final Logger log = LoggerFactory.getLogger(OrderItemReservationErrorHandler.class);

    @Override
    public void accept(ServiceBusErrorContext context) {
        log.error("Service Bus reservation processor error: {}", context.getException().getMessage());
    }
}
