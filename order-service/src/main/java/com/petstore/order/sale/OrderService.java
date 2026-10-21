package com.petstore.order.sale;

import com.petstore.order.client.ProductClient;
import com.petstore.order.client.ProductView;
import com.petstore.order.common.NotFoundException;
import com.petstore.order.common.PageResponse;
import com.petstore.order.common.UnauthorizedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orders;
    private final ProductClient productClient;

    public OrderService(OrderRepository orders, ProductClient productClient) {
        this.orders = orders;
        this.productClient = productClient;
    }

    public PageResponse<OrderResponse> list(Pageable pageable) {
        Page<CustomerOrder> page = isAdmin()
                ? orders.findAll(pageable)
                : orders.findByUserId(currentUserId(), pageable);
        return PageResponse.of(page.map(OrderResponse::from));
    }

    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        CustomerOrder order = new CustomerOrder();
        order.setUserId(currentUserId());
        order.setStatus("PLACED");
        order.setOrderDate(Instant.now());

        BigDecimal total = BigDecimal.ZERO;
        for (CheckoutItemRequest item : request.getItems()) {
            ProductView product = productClient.getProduct(item.getProductId());
            BigDecimal line = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(line);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            order.getItems().add(orderItem);
        }
        order.setTotalAmount(total);
        return OrderResponse.from(orders.save(order));
    }

    @Transactional
    public void delete(Long id) {
        if (!isAdmin()) {
            throw new UnauthorizedException("Only an admin can delete an order");
        }
        CustomerOrder order = orders.findById(id).orElseThrow(() -> new NotFoundException("Order not found"));
        orders.delete(order);
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getDetails() instanceof Long userId)) {
            throw new UnauthorizedException("Unauthorized");
        }
        return userId;
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
