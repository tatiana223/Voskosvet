package com.exemple.springexample.service;

import com.exemple.springexample.dto.CustomerResponse;
import com.exemple.springexample.dto.UpdateCustomerRoleRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Role;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.mapper.OrderMapper;
import com.exemple.springexample.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final CustomerRepository customerRepository;
    private final OrderMapper orderMapper;

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
}
