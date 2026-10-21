package com.petstore.product.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String store(MultipartFile file);

    void delete(String storedUrl);

    String readableUrl(String storedUrl);
}
