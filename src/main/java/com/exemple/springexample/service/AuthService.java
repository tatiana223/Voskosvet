package com.exemple.springexample.service;

import com.exemple.springexample.dto.AuthResponse;
import com.exemple.springexample.dto.LoginRequest;
import com.exemple.springexample.dto.RegisterRequest;
import com.exemple.springexample.dto.UpdateProfileRequest;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Role;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.repository.CustomerRepository;
import com.exemple.springexample.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public void register(RegisterRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Пользователь с таким email уже существует");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.USER);
        customer.setEmailVerified(false);

        Customer savedCustomer = customerRepository.save(customer);
        emailVerificationService.sendVerificationEmail(savedCustomer);
    }

    public AuthResponse login(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Неверный email или пароль"));

        if (customer.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new BadRequestException("Неверный email или пароль");
        }

        if (customer.isBlocked()) {
            throw new BadRequestException("Аккаунт заблокирован. Обратитесь к администратору");
        }

        if (!customer.isEmailVerified()) {
            throw new BadRequestException("Подтвердите email по ссылке из письма");
        }

        return toAuthResponse(customer);
    }

    public void resendVerification(String email) {
        customerRepository.findByEmail(email.trim())
                .filter(customer -> !customer.isEmailVerified())
                .filter(customer -> !customer.isBlocked())
                .ifPresent(emailVerificationService::sendVerificationEmail);
    }

    @Transactional
    public AuthResponse updateProfile(Customer authenticatedCustomer, UpdateProfileRequest request) {
        Customer customer = customerRepository.findById(authenticatedCustomer.getId())
                .orElseThrow(() -> new BadRequestException("Пользователь не найден"));

        customerRepository.findByEmail(request.email())
                .filter(existingCustomer -> !existingCustomer.getId().equals(customer.getId()))
                .ifPresent(existingCustomer -> {
                    throw new BadRequestException("Пользователь с таким email уже существует");
                });

        customer.setFullName(request.fullName().trim());
        customer.setPhone(request.phone().trim());
        customer.setEmail(request.email().trim());
        customer.setCity(normalizeOptional(request.city()));
        customer.setDeliveryAddress(normalizeOptional(request.deliveryAddress()));

        if (request.preferredContactMethod() != null) {
            customer.setPreferredContactMethod(request.preferredContactMethod());
        }
        if (request.defaultDeliveryMethod() != null) {
            customer.setDefaultDeliveryMethod(request.defaultDeliveryMethod());
        }
        if (request.defaultPaymentMethod() != null) {
            customer.setDefaultPaymentMethod(request.defaultPaymentMethod());
        }

        return toAuthResponse(customerRepository.save(customer));
    }

    public AuthResponse getProfile(Customer customer) {
        return new AuthResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getCity(),
                customer.getDeliveryAddress(),
                customer.getPreferredContactMethod(),
                customer.getDefaultDeliveryMethod(),
                customer.getDefaultPaymentMethod(),
                customer.getRole(),
                null
        );
    }

    private AuthResponse toAuthResponse(Customer customer) {
        String token = jwtService.generateToken(customer);

        return new AuthResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getCity(),
                customer.getDeliveryAddress(),
                customer.getPreferredContactMethod(),
                customer.getDefaultDeliveryMethod(),
                customer.getDefaultPaymentMethod(),
                customer.getRole(),
                token
        );
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
