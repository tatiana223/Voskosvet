package com.exemple.springexample.repository;

import com.exemple.springexample.entity.Order;
import com.exemple.springexample.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
            select o from Order o
            where (:status is null or o.status = :status)
              and (
                    lower(o.customer.fullName) like lower(concat('%', :search, '%'))
                    or o.customer.phone like concat('%', :search, '%')
                    or lower(o.customer.email) like lower(concat('%', :search, '%'))
              )
            """)
    Page<Order> searchOrders(
            @Param("status") OrderStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndCustomerPhone(Long id, String phone);

    List<Order> findByCustomerNormalizedPhoneOrderByCreatedAtDesc(String normalizedPhone);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
