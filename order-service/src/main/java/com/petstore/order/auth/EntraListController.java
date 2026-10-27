package com.petstore.order.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entra")
public class EntraListController {

    @GetMapping("/items")
    public List<Map<String, String>> items() {
        return List.of(
                Map.of("name", "Collar", "value", "12"),
                Map.of("name", "Leash", "value", "8"),
                Map.of("name", "Bowl", "value", "5"));
    }
}
