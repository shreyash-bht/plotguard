package com.plotguard.api.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExampleAPI {
    @GetMapping("/api/hello")
    public String hello() {
        return "hello";
    }
}
