package com.petstore.reserver.messaging;

import com.azure.messaging.servicebus.ServiceBusReceivedMessageContext;
import com.azure.spring.cloud.service.servicebus.consumer.ServiceBusRecordMessageListener;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petstore.reserver.notification.LogicAppEmailNotifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class OrderItemReservationListener implements ServiceBusRecordMessageListener {

    private static final Logger log = LoggerFactory.getLogger(OrderItemReservationListener.class);

    private final ObjectMapper json;
    private final OrderItemReserver reserver;
    private final LogicAppEmailNotifier notifier;

    public OrderItemReservationListener(ObjectMapper json, OrderItemReserver reserver, LogicAppEmailNotifier notifier) {
        this.json = json;
        this.reserver = reserver;
        this.notifier = notifier;
    }

    @Override
    public void onMessage(ServiceBusReceivedMessageContext context) {
        String body = context.getMessage().getBody().toString();
        log.info("Received order-item reservation message");
        try {
            OrderItemReservation item = json.readValue(body, OrderItemReservation.class);
            reserver.reserve(item);
            context.complete();
        } catch (RuntimeException | java.io.IOException ex) {
            notifier.notifyFailure(body, ex.getMessage());
            context.abandon();
        }
    }
}
