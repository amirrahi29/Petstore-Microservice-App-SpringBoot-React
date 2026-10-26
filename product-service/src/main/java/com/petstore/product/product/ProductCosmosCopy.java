package com.petstore.product.product;

import com.azure.cosmos.CosmosClient;
import com.azure.cosmos.CosmosContainer;
import com.azure.cosmos.models.CosmosItemRequestOptions;
import com.azure.cosmos.models.PartitionKey;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ProductCosmosCopy {

    private final String endpoint;
    private final String key;
    private final String databaseName;
    private final String containerName;
    private CosmosClient client;
    private CosmosContainer container;

    public ProductCosmosCopy(
            @Value("${app.cosmos.endpoint}") String endpoint,
            @Value("${app.cosmos.key:}") String key,
            @Value("${app.cosmos.database}") String databaseName,
            @Value("${app.cosmos.container}") String containerName) {
        this.endpoint = endpoint;
        this.key = key;
        this.databaseName = databaseName;
        this.containerName = containerName;
    }

    public void save(Product product) {
        if (product.getId() == null) {
            throw new IllegalStateException("PostgreSQL did not assign a product id");
        }
        ProductDocument document = ProductDocument.from(product);
        container().upsertItem(document, new PartitionKey(document.getId()), new CosmosItemRequestOptions());
    }

    public void delete(Long id) {
        if (id == null) {
            return;
        }
        String documentId = String.valueOf(id);
        try {
            container().deleteItem(documentId, new PartitionKey(documentId), new CosmosItemRequestOptions());
        } catch (com.azure.cosmos.CosmosException ex) {
            if (ex.getStatusCode() != 404) {
                throw ex;
            }
        }
    }

    @PreDestroy
    public void close() {
        if (client != null) {
            client.close();
        }
    }

    private CosmosContainer container() {
        if (container != null) {
            return container;
        }
        synchronized (this) {
            if (container == null) {
                if (endpoint == null || endpoint.isBlank() || key == null || key.isBlank()) {
                    throw new IllegalStateException(
                            "Set COSMOS_KEY on product-service, or the Key Vault secret cosmos-key");
                }
                if (containerName == null || containerName.isBlank() || "cart".equalsIgnoreCase(containerName)) {
                    throw new IllegalStateException("Product copies use the Cosmos container products, not cart");
                }
                client = new com.azure.cosmos.CosmosClientBuilder()
                        .endpoint(endpoint)
                        .key(key)
                        .gatewayMode()
                        .buildClient();
                container = client.getDatabase(databaseName).getContainer(containerName);
            }
            return container;
        }
    }
}
