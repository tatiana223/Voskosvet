package com.exemple.springexample.dto;

import com.exemple.springexample.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCustomerRoleRequest {

    @NotNull(message = "Роль обязательна")
    private Role role;
}