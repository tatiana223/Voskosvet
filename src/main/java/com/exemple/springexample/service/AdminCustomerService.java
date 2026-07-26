package com.exemple.springexample.service;

import com.exemple.springexample.dto.CustomerResponse;
import com.exemple.springexample.dto.UpdateCustomerRoleRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.mapper.OrderMapper;
import com.exemple.springexample.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final CustomerRepository customerRepository;
    private final OrderMapper orderMapper;

    public List<CustomerResponse> getCustomers() {
        return customerRepository.findByPasswordIsNotNullOrderByIdDesc()
                .stream()
                .map(orderMapper::toCustomerResponse)
                .toList();
    }

    public CustomerResponse updateRole(Long id, UpdateCustomerRoleRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Покупатель не найден"));

        customer.setRole(request.getRole());

        return orderMapper.toCustomerResponse(customerRepository.save(customer));
    }
}
