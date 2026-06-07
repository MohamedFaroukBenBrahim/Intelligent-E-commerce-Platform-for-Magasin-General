package com.example.backend.controller;

import com.example.backend.dto.BlogResponseDTO;
import com.example.backend.entity.Blog;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.BlogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/blog")
public class BlogController {
    private final BlogService blogService;
    private final UserRepository userRepository;

    public BlogController(BlogService blogService, UserRepository userRepository) {
        this.blogService = blogService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addBlog(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) String type,
            @RequestPart(required = false) MultipartFile image,
            Authentication authentication) {
        try {
            // Get the logged-in user from the JWT token
            String username = authentication.getName();
            User author = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Blog blog = new Blog();
            blog.setTitle(title);
            blog.setContent(content);
            blog.setType(type);
            blog.setAuthor(author);
            
            Blog savedBlog = blogService.addBlog(blog, image, author.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBlog);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> modifyBlog(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String type,
            @RequestPart(required = false) MultipartFile image) {
        try {
            Blog blogUpdates = new Blog();
            blogUpdates.setTitle(title);
            blogUpdates.setContent(content);
            blogUpdates.setType(type);
            
            // Don't change author on update - keep original
            Blog updatedBlog = blogService.modifyBlog(id, blogUpdates, image, null);
            return ResponseEntity.ok(updatedBlog);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<BlogResponseDTO>> getAllBlogs() {
        List<Blog> blogs = blogService.getAllBlogs();
        List<BlogResponseDTO> result = blogs.stream().map(blog -> {
            BlogResponseDTO dto = new BlogResponseDTO();
            dto.id = blog.getId();
            dto.title = blog.getTitle();
            dto.content = blog.getContent();
            dto.type = blog.getType();
            dto.published = blog.isPublished();
            dto.authorUsername = blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Unknown";
            dto.imageUrl = blog.getImageUrl();
            dto.createdAt = blog.getCreatedAt() != null ? blog.getCreatedAt().toString() : null;
            dto.updatedAt = blog.getUpdatedAt() != null ? blog.getUpdatedAt().toString() : null;
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/published")
    public ResponseEntity<List<Blog>> getPublishedBlogs() {
        List<Blog> blogs = blogService.getPublishedBlogs();
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        Blog blog = blogService.getBlog(id);
        return ResponseEntity.ok(blog);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteBlogById(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok(Map.of("message", "Blog deleted successfully"));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Blog> publishBlog(@PathVariable Long id) {
        Blog blog = blogService.publishBlog(id);
        return ResponseEntity.ok(blog);
    }

    @PatchMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Blog> unpublishBlog(@PathVariable Long id) {
        Blog blog = blogService.unpublishBlog(id);
        return ResponseEntity.ok(blog);
    }

    // PUBLIC - users can only search published blogs
    @GetMapping("/search")
    public ResponseEntity<Page<BlogResponseDTO>> searchPublishedBlogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageable = PageRequest.of(page, size, sort);
        Page<Blog> blogs = blogService.searchPublished(keyword, type, pageable);
        return ResponseEntity.ok(blogs.map(blog -> {
            BlogResponseDTO dto = new BlogResponseDTO();
            dto.id = blog.getId();
            dto.title = blog.getTitle();
            dto.content = blog.getContent();
            dto.type = blog.getType();
            dto.published = blog.isPublished();
            dto.authorUsername = blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Unknown";
            dto.imageUrl = blog.getImageUrl();
            dto.createdAt = blog.getCreatedAt() != null ? blog.getCreatedAt().toString() : null;
            dto.updatedAt = blog.getUpdatedAt() != null ? blog.getUpdatedAt().toString() : null;
            return dto;
        }));
    }

    // ADMIN - can search all blogs (published + unpublished)
    @GetMapping("/search/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BlogResponseDTO>> searchAllBlogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageable = PageRequest.of(page, size, sort);
        Page<Blog> blogs = blogService.searchAndFilter(keyword, type, published, pageable);
        return ResponseEntity.ok(blogs.map(blog -> {
            BlogResponseDTO dto = new BlogResponseDTO();
            dto.id = blog.getId();
            dto.title = blog.getTitle();
            dto.content = blog.getContent();
            dto.type = blog.getType();
            dto.published = blog.isPublished();
            dto.authorUsername = blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Unknown";
            dto.imageUrl = blog.getImageUrl();
            dto.createdAt = blog.getCreatedAt() != null ? blog.getCreatedAt().toString() : null;
            dto.updatedAt = blog.getUpdatedAt() != null ? blog.getUpdatedAt().toString() : null;
            return dto;
        }));
    }
}
