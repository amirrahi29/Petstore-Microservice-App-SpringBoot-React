package com.petstore.product.storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.common.sas.SasProtocol;
import com.petstore.product.common.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AzureBlobStorageService implements StorageService {

    private final String connectionString;
    private final String accountName;
    private final String accountKey;
    private final String endpoint;
    private final String containerName;
    private final int sasExpiryMinutes;
    private BlobServiceClient serviceClient;

    public AzureBlobStorageService(
            @Value("${app.storage.connection-string:}") String connectionString,
            @Value("${app.storage.account-name:}") String accountName,
            @Value("${app.storage.account-key:}") String accountKey,
            @Value("${app.storage.endpoint:}") String endpoint,
            @Value("${app.storage.container-name}") String containerName,
            @Value("${app.storage.sas-expiry-minutes}") int sasExpiryMinutes) {
        this.connectionString = connectionString == null ? "" : connectionString.trim();
        this.accountName = accountName == null ? "" : accountName.trim();
        this.accountKey = accountKey == null ? "" : accountKey.trim();
        this.endpoint = endpoint == null ? "" : endpoint.trim();
        this.containerName = containerName.trim();
        this.sasExpiryMinutes = sasExpiryMinutes;
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        String blobName = UUID.randomUUID() + extensionFor(file.getContentType());
        try {
            BlobClient blob = container().getBlobClient(blobName);
            try (InputStream input = file.getInputStream()) {
                blob.upload(input, file.getSize(), true);
                blob.setHttpHeaders(new BlobHttpHeaders().setContentType(file.getContentType()));
            }
            return blob.getBlobUrl();
        } catch (BadRequestException ex) {
            throw ex;
        } catch (IOException ex) {
            throw new BadRequestException("Could not read the image");
        } catch (RuntimeException ex) {
            throw new BadRequestException("Could not save the image to Azure Blob Storage");
        }
    }

    @Override
    public void delete(String storedUrl) {
        BlobLocation location = locate(storedUrl);
        if (location == null) {
            return;
        }
        try {
            service().getBlobContainerClient(location.container()).getBlobClient(location.name()).deleteIfExists();
        } catch (RuntimeException ex) {
            throw new BadRequestException("Could not delete the image from Azure Blob Storage");
        }
    }

    @Override
    public String readableUrl(String storedUrl) {
        BlobLocation location = locate(storedUrl);
        if (location == null) {
            return storedUrl == null || storedUrl.isBlank() ? null : storedUrl;
        }
        BlobClient blob = service().getBlobContainerClient(location.container()).getBlobClient(location.name());
        BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
        OffsetDateTime now = OffsetDateTime.now();
        BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(now.plusMinutes(sasExpiryMinutes), permission)
                .setStartTime(now.minusMinutes(5))
                .setProtocol(SasProtocol.HTTPS_ONLY);
        return blob.getBlobUrl() + "?" + blob.generateSas(values);
    }

    private BlobContainerClient container() {
        BlobContainerClient container = service().getBlobContainerClient(containerName);
        container.createIfNotExists();
        return container;
    }

    private BlobServiceClient service() {
        if (serviceClient == null) {
            serviceClient = new BlobServiceClientBuilder()
                    .connectionString(clientConnection())
                    .buildClient();
        }
        return serviceClient;
    }

    private String clientConnection() {
        if (!connectionString.isBlank()) {
            return connectionString;
        }
        if (!accountName.isBlank() && !accountKey.isBlank()) {
            String resolvedEndpoint = endpoint.isBlank()
                    ? "https://" + accountName + ".blob.core.windows.net"
                    : endpoint;
            return "DefaultEndpointsProtocol=https;AccountName=" + accountName
                    + ";AccountKey=" + accountKey
                    + ";BlobEndpoint=" + resolvedEndpoint;
        }
        throw new BadRequestException("Azure storage is not configured. Set app.storage in application.yml");
    }

    private BlobLocation locate(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            return null;
        }
        try {
            URI uri = URI.create(storedUrl);
            String host = uri.getHost();
            if (host == null || (!accountName.isBlank() && !host.startsWith(accountName + "."))) {
                return null;
            }
            String path = uri.getPath();
            if (path == null || path.length() < 3) {
                return null;
            }
            String trimmed = path.startsWith("/") ? path.substring(1) : path;
            int slash = trimmed.indexOf('/');
            if (slash <= 0 || slash == trimmed.length() - 1) {
                return null;
            }
            return new BlobLocation(trimmed.substring(0, slash), trimmed.substring(slash + 1));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private record BlobLocation(String container, String name) {
    }

    private String extensionFor(String contentType) {
        if (contentType == null) {
            throw new BadRequestException("Only jpg, png, webp, and gif images are allowed");
        }
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new BadRequestException("Only jpg, png, webp, and gif images are allowed");
        };
    }
}
