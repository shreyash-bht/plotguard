package com.plotguard.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@JsonIgnoreProperties
@AllArgsConstructor
@NoArgsConstructor
public class NewUserDto {
    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("username")
    @NonNull
    private String username;

    @JsonProperty("display_name")
    @NonNull
    private String displayName;

    @JsonProperty("email_id")
    @NonNull
    private String emailId;

    @JsonProperty("password")
    @NonNull
    private String password;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("last_login")
    private Instant lastLogin;

    @JsonProperty("status")
    private String status;
}