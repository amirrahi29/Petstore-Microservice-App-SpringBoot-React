package com.petstore.product.config;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.SecretClientBuilder;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.LinkedHashMap;
import java.util.Map;

public class KeyVaultEnvironmentPostProcessor implements EnvironmentPostProcessor,
        ApplicationContextInitializer<ConfigurableApplicationContext> {

    static final String SOURCE = "azureKeyVault";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        apply(environment);
    }

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        apply(context.getEnvironment());
    }

    private void apply(ConfigurableEnvironment environment) {
        if (environment.getPropertySources().contains(SOURCE)) {
            return;
        }
        String endpoint = environment.getProperty("app.keyvault.endpoint");
        if (endpoint == null || endpoint.isBlank()) {
            throw new IllegalStateException("Set app.keyvault.endpoint to the Azure Key Vault URL");
        }
        try {
            SecretClient client = new SecretClientBuilder()
                    .vaultUrl(endpoint)
                    .credential(new DefaultAzureCredentialBuilder().build())
                    .buildClient();
            Map<String, Object> secrets = new LinkedHashMap<>();
            secrets.put("spring.datasource.username", required(client, "username"));
            secrets.put("spring.datasource.password", required(client, "password"));
            secrets.put("app.storage.connection-string", required(client, "connection-string"));
            secrets.put("app.storage.account-key", required(client, "account-key"));
            environment.getPropertySources().addFirst(new MapPropertySource(SOURCE, secrets));
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new IllegalStateException(
                    "Could not read database or storage secrets from Azure Key Vault " + endpoint
                            + ". Sign in with Azure CLI (az login) using an account that can get secrets.",
                    ex);
        }
    }

    private static String required(SecretClient client, String name) {
        String value = client.getSecret(name).getValue();
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Azure Key Vault secret '" + name + "' is empty");
        }
        return value;
    }
}
