package com.example.backend.service;

import com.example.backend.dto.LoginUserDto;
import com.example.backend.dto.RegisterUserDto;
import com.example.backend.dto.VerifyUserDto;
import com.example.backend.entity.RevokedToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.RevokedTokenRepository;
import com.example.backend.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;


@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final RevokedTokenRepository revokedTokenRepository;

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 AuthenticationManager authenticationManager,
                                 EmailService emailService, RevokedTokenRepository revokedTokenRepository)
    {
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.authenticationManager=authenticationManager;
        this.emailService=emailService;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    public User signup(RegisterUserDto input){
    User user=new User(input.getUsername(),input.getEmail(),passwordEncoder.encode(input.getPassword()));
    user.setVerificationCode(generateVerificationCode());
    user.setVerificationExpiration(LocalDateTime.now().plusMinutes(15));
    user.setEnabled(false);
    user.setProvider("LOCAL");
    user.setRole(Role.USER); // Set default role
    sendVerificationEmail(user);
    return userRepository.save(user);

    }

    public User authenticate(LoginUserDto input){
        User user=userRepository.findByEmail(input.getEmail())
                .orElseThrow(()->new RuntimeException("User not found!"));
        
        // Use the username for authentication manager since UserDetailsService expects username
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        input.getPassword())
        );
        
        if (!user.isEnabled()){
            throw new RuntimeException("Account not Verified,please verify your account");
        }
        return user;
    }

    public void verifyUser(VerifyUserDto input){
        Optional<User> optionaluser=userRepository.findByEmail(input.getEmail());
        if(optionaluser.isPresent()){
            User user=optionaluser.get();
            if(user.getVerificationExpiration().isBefore(LocalDateTime.now())){
                throw new RuntimeException("Account Expired,please verify your account");
            }
            if(user.getVerificationCode().equals(input.getVerificationCode())){
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationExpiration(null);
                userRepository.save(user);
            }else{
                throw new RuntimeException("invalid verification code");
            }
        }else {
            throw new RuntimeException("User not found");
        }
    }
    public void resendVerificationCode(String email){
        Optional<User> optionaluser=userRepository.findByEmail(email);
        if(optionaluser.isPresent()){
            User user=optionaluser.get();
            if(user.isEnabled()){
                throw new RuntimeException("Account is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationExpiration(LocalDateTime.now().plusMinutes(15));
            sendVerificationEmail(user);
            userRepository.save(user);
        }else{
            throw new RuntimeException("User not found");
        }
    }

    public void sendVerificationEmail(User user){
        String subject = "Account verification";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
        try{
            emailService.sendVerificationMail(user.getEmail(),subject,htmlMessage);
        }catch (MessagingException e){
            e.printStackTrace();
        }

    }

    private String generateVerificationCode(){
        Random random=new Random();
        int code=random.nextInt(900000)+100000;
        return String.valueOf(code);
    }

    public void logout(String token) {
        RevokedToken revokedToken = new RevokedToken();
        revokedToken.setToken(token);
        // Set an expiration date for the record (e.g., 24 hours from now)
        revokedToken.setExpirationDate(java.time.LocalDateTime.now().plusHours(24));
        revokedTokenRepository.save(revokedToken);
    }

    public void forgotPassword(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setResetPasswordToken(generateVerificationCode());
            user.setResetPasswordExpiration(LocalDateTime.now().plusMinutes(15));
            sendPasswordResetEmail(user);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void resetPassword(String token, String newPassword) {
        Optional<User> optionalUser = userRepository.findByResetPasswordToken(token);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getResetPasswordExpiration().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Reset token has expired");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setResetPasswordExpiration(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid reset token");
        }
    }

    public void sendPasswordResetEmail(User user) {
        String subject = "Password Reset Request";
        String resetToken = user.getResetPasswordToken();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Password Reset Request</h2>"
                + "<p style=\"font-size: 16px;\">We received a request to reset your password. Please use the code below to reset your password:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Reset Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + resetToken + "</p>"
                + "<p style=\"font-size: 14px; color: #666;\">This code will expire in 15 minutes.</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #999; margin-top: 20px;\">If you didn't request a password reset, please ignore this email.</p>"
                + "</div>"
                + "</body>"
                + "</html>";
        try {
            emailService.sendVerificationMail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
