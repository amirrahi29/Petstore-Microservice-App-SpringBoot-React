package com.petstore.pet;

import com.petstore.pet.config.KeyVaultEnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PetServiceApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(PetServiceApplication.class);
        application.addInitializers(new KeyVaultEnvironmentPostProcessor());
        application.run(args);
    }
}
