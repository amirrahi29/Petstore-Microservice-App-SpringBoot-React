package com.petstore.product;

import com.petstore.product.config.KeyVaultEnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProductServiceApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(ProductServiceApplication.class);
        application.addInitializers(new KeyVaultEnvironmentPostProcessor());
        application.run(args);
    }
}
