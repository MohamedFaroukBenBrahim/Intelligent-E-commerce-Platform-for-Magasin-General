package com.example.backend.config;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        
        // Find or create user
        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;
        
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            // Create new user from Google OAuth2
            user = new User();
            user.setEmail(email);
            user.setUsername(name != null ? name : email.split("@")[0]);
            user.setProvider("GOOGLE");
            user.setEnabled(true); // Google users are already verified
            user.setPassword(null); // No password for OAuth2 users
            user.setRole(Role.USER); // Set default role
            userRepository.save(user);
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        // Redirect to frontend with token
        String redirectUrl = String.format("http://localhost:4200/oauth2/redirect?token=%s", token);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
