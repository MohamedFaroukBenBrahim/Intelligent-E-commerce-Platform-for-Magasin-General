package com.example.backend.service;

import com.example.backend.entity.Blog;
import com.example.backend.entity.User;
import com.example.backend.repository.BlogRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class BlogService {
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final MinioStorageService storageService;

    public BlogService(BlogRepository blogRepository, UserRepository userRepository, MinioStorageService storageService) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    public Blog addBlog(Blog blog, MultipartFile image, Long authorId) {
        if (authorId != null) {
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));
            blog.setAuthor(author);
        }
        if (image != null && !image.isEmpty()) {
            String imageUrl = storageService.uploadFile(image, "blogs");
            blog.setImageUrl(imageUrl);
        }
        return blogRepository.save(blog);
    }

    public Blog modifyBlog(Long id, Blog blogUpdates, MultipartFile image, Long authorId) {
        Blog existingBlog = getBlog(id);
        
        // Update fields
        if (blogUpdates.getTitle() != null) {
            existingBlog.setTitle(blogUpdates.getTitle());
        }
        if (blogUpdates.getContent() != null) {
            existingBlog.setContent(blogUpdates.getContent());
        }
        if (blogUpdates.getType() != null) {
            existingBlog.setType(blogUpdates.getType());
        }
        
        // Update author
        if (authorId != null) {
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));
            existingBlog.setAuthor(author);
        }
        
        // Update image
        if (image != null && !image.isEmpty()) {
            if (existingBlog.getImageUrl() != null) {
                storageService.deleteFile(existingBlog.getImageUrl());
            }
            String imageUrl = storageService.uploadFile(image, "blogs");
            existingBlog.setImageUrl(imageUrl);
        }
        
        return blogRepository.save(existingBlog);
    }

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public List<Blog> getPublishedBlogs() {
        return blogRepository.findByPublishedTrue();
    }

    public Blog getBlog(Long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id));
    }

    public void deleteBlog(Long id) {
        Blog blog = getBlog(id);
        if (blog.getImageUrl() != null) {
            storageService.deleteFile(blog.getImageUrl());
        }
        blogRepository.deleteById(id);
    }

    public Blog publishBlog(Long id) {
        Blog blog = getBlog(id);
        blog.setPublished(true);
        return blogRepository.save(blog);
    }

    public Blog unpublishBlog(Long id) {
        Blog blog = getBlog(id);
        blog.setPublished(false);
        return blogRepository.save(blog);
    }

    public Page<Blog> searchAndFilter(String keyword, String type, Boolean published, Pageable pageable) {
        return blogRepository.searchAndFilter(keyword, type, published, pageable);
    }

    public Page<Blog> searchPublished(String keyword, String type, Pageable pageable) {
        return blogRepository.searchPublished(keyword, type, pageable);
    }
}
