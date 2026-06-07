package com.example.backend.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private long expires_in;

    public LoginResponse(String token, long expires_in) {
        this.token=token;
        this.expires_in=expires_in;

    }
}
