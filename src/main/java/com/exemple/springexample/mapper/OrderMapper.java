package com.exemple.springexample.mapper;

import com.exemple.springexample.dto.CustomerResponse;
import com.exemple.springexample.dto.OrderItemResponse;
import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Order;
import com.exemple.springexample.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    CustomerResponse toCustomerResponse(Customer customer);

    @Mapping(source = "candle.id", target = "candleId")
    @Mapping(source = "candle.name", target = "candleName")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(orderItem))")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    OrderResponse toOrderResponse(Order order);

    default BigDecimal calculateSubtotal(OrderItem orderItem) {
        if (orderItem.getPriceAtPurchase() == null || orderItem.getQuantity() == null) {
            return BigDecimal.ZERO;
        }

        return orderItem.getPriceAtPurchase()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));
    }
}