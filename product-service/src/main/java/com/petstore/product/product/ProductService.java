package com.petstore.product.product;

import com.petstore.product.category.CategoryService;
import com.petstore.product.common.NotFoundException;
import com.petstore.product.common.PageResponse;
import com.petstore.product.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository products;
    private final CategoryService categories;
    private final StorageService storageService;
    private final ProductCosmosCopy cosmosCopies;

    public PageResponse<ProductResponse> list(Pageable pageable) {
        return PageResponse.of(products.findAll(pageable).map(this::present));
    }

    public ProductResponse get(Long id) {
        return present(find(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        Product saved = products.save(product);
        cosmosCopies.save(saved);
        return present(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = find(id);
        apply(product, request);
        Product saved = products.save(product);
        cosmosCopies.save(saved);
        return present(saved);
    }

    @Transactional
    public void delete(Long id) {
        Product product = find(id);
        storageService.delete(product.getImageUrl());
        products.delete(product);
        cosmosCopies.delete(id);
    }

    @Transactional
    public ProductResponse storeImage(Long id, MultipartFile file) {
        Product product = find(id);
        String previous = product.getImageUrl();
        product.setImageUrl(storageService.store(file));
        ProductResponse saved = present(products.save(product));
        if (previous != null && !previous.equals(product.getImageUrl())) {
            storageService.delete(previous);
        }
        return saved;
    }

    private ProductResponse present(Product product) {
        ProductResponse response = ProductResponse.from(product);
        return new ProductResponse(
                response.getId(),
                response.getName(),
                response.getCategory(),
                response.getDescription(),
                response.getPrice(),
                storageService.readableUrl(product.getImageUrl()));
    }

    private Product find(Long id) {
        return products.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setCategory(categories.requireName(request.getCategory()));
        product.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
        product.setPrice(request.getPrice());
    }
}
