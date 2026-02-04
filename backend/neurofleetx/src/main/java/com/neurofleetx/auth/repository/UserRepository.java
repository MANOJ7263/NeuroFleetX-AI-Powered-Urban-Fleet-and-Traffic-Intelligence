package com.neurofleetx.auth.repository;

import com.neurofleetx.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<User> findByRole(com.neurofleetx.auth.entity.Role role);
}
