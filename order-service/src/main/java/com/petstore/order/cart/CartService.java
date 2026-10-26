package com.petstore.order.cart;

import com.azure.cosmos.CosmosClient;
import com.azure.cosmos.CosmosContainer;
import com.azure.cosmos.CosmosException;
import com.azure.cosmos.models.CosmosItemRequestOptions;
import com.azure.cosmos.models.PartitionKey;
import com.petstore.order.common.UnauthorizedException;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final String endpoint;
    private final String key;
    private final String database;
    private final String containerName;
    private CosmosClient client;
    private CosmosContainer container;

    public CartService(
            @Value("${app.cosmos.endpoint}") String endpoint,
            @Value("${app.cosmos.key:}") String key,
            @Value("${app.cosmos.database}") String database,
            @Value("${app.cosmos.container}") String containerName) {
        this.endpoint = endpoint;
        this.key = key;
        this.database = database;
        this.containerName = containerName;
    }

    public CartResponse get() {
        String userId = currentUserId();
        return CartResponse.from(read(userId));
    }

    public CartResponse save(CartWrite request) {
        String userId = currentUserId();
        CartDocument document = new CartDocument();
        document.setId(userId);
        document.setUserId(userId);
        document.setItems(request.getItems() == null ? List.of() : request.getItems());
        try {
            container().upsertItem(document, new PartitionKey(userId), new CosmosItemRequestOptions());
        } catch (CartUnavailableException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new CartUnavailableException("Could not save the cart", ex);
        }
        return CartResponse.from(document);
    }

    @PreDestroy
    public void close() {
        if (client != null) {
            client.close();
        }
    }

    private CartDocument read(String userId) {
        try {
            return container().readItem(userId, new PartitionKey(userId), CartDocument.class).getItem();
        } catch (CartUnavailableException ex) {
            throw ex;
        } catch (CosmosException ex) {
            if (ex.getStatusCode() == 404) {
                CartDocument empty = new CartDocument();
                empty.setId(userId);
                empty.setUserId(userId);
                empty.setItems(List.of());
                return empty;
            }
            throw new CartUnavailableException("Could not read the cart", ex);
        } catch (RuntimeException ex) {
            throw new CartUnavailableException("Could not read the cart", ex);
        }
    }

    private CosmosContainer container() {
        if (container != null) {
            return container;
        }
        synchronized (this) {
            if (container == null) {
                if (endpoint == null || endpoint.isBlank() || key == null || key.isBlank()) {
                    throw new CartUnavailableException(
                            "Set COSMOS_KEY or the Key Vault secret cosmos-key, and COSMOS_ENDPOINT");
                }
                client = new com.azure.cosmos.CosmosClientBuilder()
                        .endpoint(endpoint)
                        .key(key)
                        .gatewayMode()
                        .buildClient();
                container = client.getDatabase(database).getContainer(containerName);
            }
            return container;
        }
    }

    private static String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getDetails() instanceof Long userId)) {
            throw new UnauthorizedException("Unauthorized");
        }
        return String.valueOf(userId);
    }
}
