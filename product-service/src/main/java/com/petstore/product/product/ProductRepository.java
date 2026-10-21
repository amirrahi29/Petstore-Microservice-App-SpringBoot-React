package com.petstore.product.product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    long countByCategoryIgnoreCase(String category);
}
