package com.petstore.product.category;

import com.petstore.product.common.BadRequestException;
import com.petstore.product.common.NotFoundException;
import com.petstore.product.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categories;
    private final ProductRepository products;

    public CategoryService(CategoryRepository categories, ProductRepository products) {
        this.categories = categories;
        this.products = products;
    }

    public List<CategoryResponse> list() {
        return categories.findAll().stream()
                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.getName().trim();
        if (categories.findByNameIgnoreCase(name).isPresent()) {
            throw new BadRequestException("That category already exists");
        }
        Category category = new Category();
        category.setName(name);
        return CategoryResponse.from(categories.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        if (products.countByCategoryIgnoreCase(category.getName()) > 0) {
            throw new BadRequestException("This category is used by a pet");
        }
        categories.delete(category);
    }

    public String requireName(String name) {
        return categories.findByNameIgnoreCase(name.trim())
                .map(Category::getName)
                .orElseThrow(() -> new BadRequestException("Choose a category"));
    }
}
