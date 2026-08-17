package com.plotguard.api.login;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest{
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("password")
    private String password;
}