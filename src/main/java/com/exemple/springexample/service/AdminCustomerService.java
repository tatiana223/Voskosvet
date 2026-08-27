package com.exemple.springexample.service;

import com.exemple.springexample.dto.CustomerResponse;
import com.exemple.springexample.dto.CreateManagerRequest;
import com.exemple.springexample.dto.UpdateCustomerBlockRequest;
import com.exemple.springexample.dto.UpdateCustomerRoleRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Role;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.mapper.OrderMapper;
import com.exemple.springexample.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final CustomerRepository customerRepository;
    private final OrderMapper orderMapper;
    private final PasswordEncoder passwordEncoder;

    public CustomerResponse createManager(CreateManagerRequest request) {
        String login = request.login().trim().toLowerCase();
        if (customerRepository.findByEmailIgnoreCase(login).isPresent()) {
            throw new BadRequestException("Этот логин уже занят");
        }

        Customer manager = new Customer();
        manager.setFullName(request.firstName().trim() + " " + request.lastName().trim());
        manager.setPhone("Не указан");
        manager.setEmail(login);
        manager.setPassword(passwordEncoder.encode(request.password()));
        manager.setRole(Role.MANAGER);
        manager.setEmailVerified(true);

        return orderMapper.toCustomerResponse(customerRepository.save(manager));
    }

    public List<CustomerResponse> getCustomers() {
        return customerRepository.findByPasswordIsNotNullOrderByIdDesc()
                .stream()
                .sorted(Comparator.comparing(Customer::isPrimaryAdmin).reversed())
                .map(orderMapper::toCustomerResponse)
                .toList();
    }

    public CustomerResponse updateRole(Long id, UpdateCustomerRoleRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Покупатель не найден"));

        if (customer.isPrimaryAdmin() && request.getRole() != Role.ADMIN) {
            throw new BadRequestException("Роль главного администратора нельзя понизить");
        }

        customer.setRole(request.getRole());

        return orderMapper.toCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateBlock(Long id, UpdateCustomerBlockRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Покупатель не найден"));

        if (customer.isPrimaryAdmin()) {
            throw new BadRequestException("Главного администратора нельзя заблокировать");
        }

        customer.setBlocked(request.blocked());
        customer.setBlockedReason(request.blocked() ? normalizeReason(request.reason()) : null);
        customer.setBlockedAt(request.blocked() ? LocalDateTime.now() : null);

        return orderMapper.toCustomerResponse(customerRepository.save(customer));
    }

    private String normalizeReason(String reason) {
        return reason == null || reason.isBlank() ? "Причина не указана" : reason.trim();
    }
}
