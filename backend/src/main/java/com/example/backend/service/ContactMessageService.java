package com.example.backend.service;

import com.example.backend.entity.ContactMessage;
import com.example.backend.repository.ContactMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    public ContactMessage sendMessage(ContactMessage message) {
        return contactMessageRepository.save(message);
    }

    public Page<ContactMessage> getAllMessages(String keyword, Boolean read, Pageable pageable) {
        return contactMessageRepository.searchAndFilter(keyword, read, pageable);
    }

    public ContactMessage markAsRead(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        message.setRead(true);
        return contactMessageRepository.save(message);
    }

    public void deleteMessage(Long id) {
        contactMessageRepository.deleteById(id);
    }
}
