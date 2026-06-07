package com.example.backend.controller;

import com.example.backend.dto.ContactMessageDto;
import com.example.backend.entity.ContactMessage;
import com.example.backend.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contact")
public class ContactController {
    private final ContactMessageService contactMessageService;
    public ContactController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }
    // --- Public: any visitor can send a contact message
    @PostMapping
    public ResponseEntity<ContactMessage> sendMessage(@Valid @RequestBody ContactMessageDto dto) {
        ContactMessage message = new ContactMessage();
        message.setName(dto.getName());
        message.setEmail(dto.getEmail());
        message.setSubject(dto.getSubject());
        message.setMessage(dto.getMessage());
        return ResponseEntity.ok(contactMessageService.sendMessage(message));
    }
    // --- Admin: view all contact messages with optional filtering ---
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ContactMessage>> getAllMessages(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(contactMessageService.getAllMessages(keyword, read, pageable));
    }
    // --- Admin: mark a message as read ---
    @PatchMapping("/admin/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactMessage> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactMessageService.markAsRead(id));
    }
    // --- Admin: delete a message ---
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}