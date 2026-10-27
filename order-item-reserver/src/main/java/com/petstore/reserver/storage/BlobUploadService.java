package com.petstore.reserver.storage;

import com.azure.core.util.BinaryData;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.common.policy.RequestRetryOptions;
import com.azure.storage.common.policy.RetryPolicyType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class BlobUploadService {

    private final String connectionString;
    private final String containerName;
    private final int maxAttempts;
    private final int tryTimeoutSeconds;
    private final int delaySeconds;
    private final int maxDelaySeconds;

    public BlobUploadService(
            @Value("${app.storage.connection-string:}") String connectionString,
            @Value("${app.storage.container-name}") String containerName,
            @Value("${app.storage.retry.max-attempts}") int maxAttempts,
            @Value("${app.storage.retry.try-timeout-seconds}") int tryTimeoutSeconds,
            @Value("${app.storage.retry.delay-seconds}") int delaySeconds,
            @Value("${app.storage.retry.max-delay-seconds}") int maxDelaySeconds) {
        this.connectionString = connectionString == null ? "" : connectionString.trim();
        this.containerName = containerName;
        this.maxAttempts = maxAttempts;
        this.tryTimeoutSeconds = tryTimeoutSeconds;
        this.delaySeconds = delaySeconds;
        this.maxDelaySeconds = maxDelaySeconds;
    }

    public String upload(String blobName, byte[] content, String contentType) {
        if (connectionString.isBlank()) {
            throw new IllegalStateException("Azure storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING.");
        }
        BlobContainerClient container = client().getBlobContainerClient(containerName);
        container.createIfNotExists();
        BlobClient blob = container.getBlobClient(blobName);
        blob.upload(BinaryData.fromBytes(content), true);
        if (contentType != null && !contentType.isBlank()) {
            blob.setHttpHeaders(new BlobHttpHeaders().setContentType(contentType));
        }
        return blob.getBlobUrl();
    }

    private BlobServiceClient client() {
        RequestRetryOptions retry = new RequestRetryOptions(
                RetryPolicyType.EXPONENTIAL,
                maxAttempts,
                Duration.ofSeconds(tryTimeoutSeconds),
                Duration.ofSeconds(delaySeconds),
                Duration.ofSeconds(maxDelaySeconds),
                null);
        return new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .retryOptions(retry)
                .buildClient();
    }
}
