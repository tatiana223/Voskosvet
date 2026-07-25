package com.exemple.springexample.service;

import com.exemple.springexample.dto.AuthResponse;
import com.exemple.springexample.dto.LoginRequest;
import com.exemple.springexample.dto.RegisterRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Role;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.repository.CustomerRepository;
import com.exemple.springexample.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Пользователь с таким email уже существует");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.USER);

        Customer savedCustomer = customerRepository.save(customer);

        return toAuthResponse(savedCustomer);
    }

    public AuthResponse login(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Неверный email или пароль"));

        if (customer.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new BadRequestException("Неверный email или пароль");
        }

        return toAuthResponse(customer);
    }

    private AuthResponse toAuthResponse(Customer customer) {
        String token = jwtService.generateToken(customer);

        return new AuthResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getRole(),
                token
        );
    }
}