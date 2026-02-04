package com.neurofleetx.auth.dto;

import com.neurofleetx.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    public String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    @NotBlank(message = "Name is required")
    public String name;

    @NotBlank(message = "Phone is required")
    public String phone;

    @NotNull(message = "Role is required")
    public Role role;
}
