package com.exemple.springexample.controller;

import com.exemple.springexample.dto.CustomerResponse;
import com.exemple.springexample.dto.CreateManagerRequest;
import com.exemple.springexample.dto.UpdateCustomerBlockRequest;
import com.exemple.springexample.dto.UpdateCustomerRoleRequest;
import com.exemple.springexample.service.AdminCustomerService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@SecurityRequirement(name = "basicAuth")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public List<CustomerResponse> getCustomers() {
        return adminCustomerService.getCustomers();
    }

    @PatchMapping("/{id}/role")
    public CustomerResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRoleRequest request
    ) {
        return adminCustomerService.updateRole(id, request);
    }

    @PostMapping("/managers")
    public CustomerResponse createManager(@Valid @RequestBody CreateManagerRequest request) {
        return adminCustomerService.createManager(request);
    }

    @PatchMapping("/{id}/block")
    public CustomerResponse updateBlock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerBlockRequest request
    ) {
        return adminCustomerService.updateBlock(id, request);
    }
}
