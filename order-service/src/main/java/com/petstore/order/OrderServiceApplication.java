package com.petstore.order;

import com.petstore.order.config.KeyVaultEnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(OrderServiceApplication.class);
        application.addInitializers(new KeyVaultEnvironmentPostProcessor());
        application.run(args);
    }
}
