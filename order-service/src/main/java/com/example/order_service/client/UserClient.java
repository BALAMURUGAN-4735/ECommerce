package com.example.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.example.order_service.dto.UserDTO;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/users/{id}")
    UserDTO getUserProfile(@PathVariable("id") Long id);

    @GetMapping("/users/email/{email}")
    UserDTO getUserByEmail(@PathVariable("email") String email);
}