package com.exemple.springexample.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import com.exemple.springexample.security.CustomAccessDeniedHandler;
import com.exemple.springexample.security.CustomAuthenticationEntryPoint;
import com.exemple.springexample.security.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CustomAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/h2-console/**"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/candles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/*/tracking").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/me/orders").authenticated()

                        .requestMatchers("/api/admin/candles/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/admin/categories/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/admin/orders/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/admin/customers/**").hasRole("ADMIN")

                        .anyRequest().denyAll()
                )
                .httpBasic(Customizer.withDefaults())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${app.admin.username}") String username,
            @Value("${app.admin.password}") String password,
            @Value("${app.manager.username}") String managerUsername,
            @Value("${app.manager.password}") String managerPassword,
            PasswordEncoder passwordEncoder
    ) {
        UserDetails admin = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .roles("ADMIN")
                .build();

        UserDetails manager = User.builder()
                .username(managerUsername)
                .password(passwordEncoder.encode(managerPassword))
                .roles("MANAGER")
                .build();

        return new InMemoryUserDetailsManager(admin, manager);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
