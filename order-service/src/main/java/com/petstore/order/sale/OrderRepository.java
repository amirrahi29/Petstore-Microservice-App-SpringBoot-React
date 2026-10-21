package com.petstore.order.sale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = "items")
    Page<CustomerOrder> findByUserId(Long userId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "items")
    Page<CustomerOrder> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "items")
    Optional<CustomerOrder> findById(Long id);
}
