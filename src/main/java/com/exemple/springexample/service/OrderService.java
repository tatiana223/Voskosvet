package com.exemple.springexample.service;

import com.exemple.springexample.dto.CreateOrderItemRequest;
import com.exemple.springexample.dto.CreateOrderRequest;
import com.exemple.springexample.dto.OrderResponse;
import com.exemple.springexample.dto.PageResponse;
import com.exemple.springexample.dto.UpdateOrderStatusRequest;
import com.exemple.springexample.entity.Candle;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Order;
import com.exemple.springexample.entity.OrderItem;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.mapper.OrderMapper;
import com.exemple.springexample.model.ContactMethod;
import com.exemple.springexample.model.OrderStatus;
import com.exemple.springexample.model.PaymentStatus;
import com.exemple.springexample.repository.CandleRepository;
import com.exemple.springexample.repository.CustomerRepository;
import com.exemple.springexample.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CandleRepository candleRepository;
    private final CustomerRepository customerRepository;

    public OrderResponse createOrder(CreateOrderRequest request) {
        return createOrder(request, null);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Customer authenticatedCustomer) {
        Customer customer = resolveOrderCustomer(request, authenticatedCustomer);

        Order order = new Order();
        order.setCustomer(customer);
        order.setDeliveryMethod(request.deliveryMethod());
        order.setCity(request.city());
        order.setDeliveryAddress(request.deliveryAddress());
        order.setDeliveryComment(request.deliveryComment());
        order.setContactEmail(request.customerEmail());
        order.setPreferredContactMethod(
                request.preferredContactMethod() == null
                        ? ContactMethod.PHONE
                        : request.preferredContactMethod()
        );
        order.setPaymentMethod(request.paymentMethod());
        order.setPaymentStatus(
                request.paymentMethod() == com.exemple.springexample.model.PaymentMethod.CARD_ONLINE
                        ? PaymentStatus.PENDING
                        : PaymentStatus.NOT_REQUIRED
        );
        order.setComment(request.comment());

        BigDecimal itemsPrice = BigDecimal.ZERO;
        validateNoDuplicateCandles(request.items());

        for (CreateOrderItemRequest itemRequest : request.items()) {
            Candle candle = candleRepository.findById(itemRequest.candleId())
                    .orElseThrow(() -> new NotFoundException("Свеча не найдена"));

            if (!Boolean.TRUE.equals(candle.getAvailable())) {
                throw new NotFoundException("Свеча недоступна для заказа");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setCandle(candle);
            BigDecimal unitPrice = resolveUnitPrice(candle, itemRequest.packageSize());
            int totalCandles = Math.multiplyExact(itemRequest.packageSize(), itemRequest.quantity());
            orderItem.setPriceAtPurchase(unitPrice);
            orderItem.setPackageSize(itemRequest.packageSize());
            orderItem.setBoxQuantity(itemRequest.quantity());
            orderItem.setQuantity(totalCandles);

            order.getItems().add(orderItem);

            BigDecimal subtotal = unitPrice
                    .multiply(BigDecimal.valueOf(totalCandles));
            itemsPrice = itemsPrice.add(subtotal);
        }

        BigDecimal deliveryPrice = request.deliveryPrice() == null
                ? BigDecimal.ZERO
                : request.deliveryPrice();

        order.setItemsPrice(itemsPrice);
        order.setDeliveryPrice(deliveryPrice);
        order.setTotalPrice(itemsPrice.add(deliveryPrice));

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toOrderResponse(savedOrder);
    }

    private Customer resolveOrderCustomer(
            CreateOrderRequest request,
            Customer authenticatedCustomer
    ) {
        if (authenticatedCustomer != null && authenticatedCustomer.getId() != null) {
            Customer customer = customerRepository.findById(authenticatedCustomer.getId())
                    .orElseThrow(() -> new NotFoundException("Покупатель не найден"));

            customer.setFullName(request.customerFullName());
            customer.setPhone(request.customerPhone());

            return customer;
        }

        Customer customer = new Customer();
        customer.setFullName(request.customerFullName());
        customer.setPhone(request.customerPhone());
        customer.setEmail("guest-" + UUID.randomUUID() + "@example.local");

        return customer;
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(
            OrderStatus status,
            String search,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                normalizePage(page),
                normalizeSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        String normalizedSearch = search == null || search.isBlank()
                ? null
                : search.trim();

        Page<Order> ordersPage;

        if (normalizedSearch == null) {
            ordersPage = status == null
                    ? orderRepository.findAll(pageable)
                    : orderRepository.findByStatus(status, pageable);
        } else {
            ordersPage = orderRepository.searchOrders(
                    status,
                    normalizedSearch,
                    pageable
            );
        }

        List<OrderResponse> items = ordersPage.getContent()
                .stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        return new PageResponse<>(
                items,
                ordersPage.getNumber(),
                ordersPage.getSize(),
                ordersPage.getTotalElements(),
                ordersPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));

        return orderMapper.toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse trackOrder(Long id, String phone) {
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Укажите телефон для отслеживания заказа");
        }

        Order order = orderRepository.findByIdAndCustomerPhone(id, phone.trim())
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));

        return orderMapper.toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> trackOrders(String phone, String surname) {
        if (phone == null || phone.isBlank() || surname == null || surname.isBlank()) {
            throw new BadRequestException("Укажите телефон и фамилию");
        }

        List<OrderResponse> orders = orderRepository
                .findByCustomerNormalizedPhoneOrderByCreatedAtDesc(Customer.normalizePhone(phone))
                .stream()
                .filter(order -> hasExactNamePart(order.getCustomer().getFullName(), surname))
                .map(orderMapper::toOrderResponse)
                .toList();

        if (orders.isEmpty()) {
            throw new NotFoundException("Заказы не найдены");
        }

        return orders;
    }

    private boolean hasExactNamePart(String fullName, String surname) {
        if (fullName == null) {
            return false;
        }

        String expectedSurname = surname.trim();
        return java.util.Arrays.stream(fullName.trim().split("\\s+"))
                .anyMatch(namePart -> namePart.equalsIgnoreCase(expectedSurname));
    }

    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заказ не найден"));

        order.setStatus(request.status());

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toOrderResponse(savedOrder);
    }

    private int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private int normalizeSize(int size) {
        if (size < 1) {
            return 20;
        }

        return Math.min(size, 100);
    }

    private void validateNoDuplicateCandles(List<CreateOrderItemRequest> items) {
        Set<String> candlePackages = new HashSet<>();

        for (CreateOrderItemRequest item : items) {
            String packageKey = item.candleId() + ":" + item.packageSize();
            if (!candlePackages.add(packageKey)) {
                throw new BadRequestException("Одинаковая коробка не должна повторяться в заказе");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCurrentCustomerOrders(Customer customer) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    private BigDecimal resolveUnitPrice(Candle candle, int quantity) {
        if (candle.getPriceTiers().isEmpty()) {
            return candle.getPrice();
        }

        return candle.getPriceTiers().stream()
                .filter(tier -> tier.getQuantity() == quantity)
                .findFirst()
                .map(tier -> tier.getUnitPrice())
                .orElseThrow(() -> new BadRequestException(
                        "Выберите один из доступных вариантов коробки для свечи «"
                                + candle.getName() + "»"
                ));
    }
}
