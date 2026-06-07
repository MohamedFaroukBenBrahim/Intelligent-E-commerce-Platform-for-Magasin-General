package com.example.backend.config;

import com.example.backend.repository.RevokedTokenRepository;
import com.example.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter  extends OncePerRequestFilter {
    private final HandlerExceptionResolver handlerExceptionResolver;

    private final JwtService jwtService;

    private final UserDetailsService userDetailsService;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtAuthenticationFilter(HandlerExceptionResolver handlerExceptionResolver, JwtService jwtService, UserDetailsService userDetailsService, RevokedTokenRepository revokedTokenRepository){
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)throws ServletException, IOException
    {
        //give access from start
        String path = request.getRequestURI();
        if (path.startsWith("/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }


            // Skip JWT validation for logout endpoint
            if (request.getServletPath().equals("/auth/logout")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String authHeader= request.getHeader("Authorization");
            if(authHeader==null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
            }
            try {
                final String jwt=authHeader.substring(7);
                if (revokedTokenRepository.existsByToken(jwt)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token has been revoked. Please log in again.");
                    return; // Important: Stop the filter chain here//
                }
                final String userEmail=jwtService.extractUsername(jwt);

                Authentication authentication= SecurityContextHolder.getContext().getAuthentication();

                if(userEmail!=null && authentication==null){
                    UserDetails userDetails=userDetailsService.loadUserByUsername(userEmail);
                    
                    System.out.println("=== JWT FILTER DEBUG ===");
                    System.out.println("User: " + userDetails.getUsername());
                    System.out.println("Authorities: " + userDetails.getAuthorities());
                    System.out.println("Token valid: " + jwtService.isTokenValid(jwt,userDetails));

                    if(jwtService.isTokenValid(jwt,userDetails)){
                        UsernamePasswordAuthenticationToken authToken=new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("Authentication set in SecurityContext with authorities: " + authToken.getAuthorities());
                    }
                }
                filterChain.doFilter(request,response);
            }catch (Exception e){
                handlerExceptionResolver.resolveException(request,response,null,e);
            }
    }
}
