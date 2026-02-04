package com.neurofleetx.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/test/admin").hasRole("ADMIN")
                        .requestMatchers("/api/trips/optimize").authenticated()

                        // Valid for Vehicle and Trip modules
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vehicles/**", "/api/trips/**")
                        .authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/vehicles")
                        .hasAnyRole("ADMIN", "MANAGER", "DRIVER")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/vehicles/**")
                        .hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/trips/request").hasRole("CUSTOMER")
                        .requestMatchers("/api/trips/*/start").hasRole("DRIVER")
                        .requestMatchers("/api/trips/**", "/api/manager/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // New Trip Booking System
                        .requestMatchers("/api/bookings/**").authenticated()
                        .requestMatchers("/api/offers/**").authenticated()

                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
