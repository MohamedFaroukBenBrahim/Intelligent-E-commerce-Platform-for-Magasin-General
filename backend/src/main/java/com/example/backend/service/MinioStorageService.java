package com.example.backend.service;

import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class MinioStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    public MinioStorageService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    // Runs on startup: creates the bucket if it doesn't exist and sets it to public
    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
            // Set public read policy
            String policy = """
                    {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {"AWS": ["*"]},
                                "Action": ["s3:GetObject"],
                                "Resource": ["arn:aws:s3:::%s/*"]
                            }
                        ]
                    }
                    """.formatted(bucket);
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build());
        } catch (Exception e) {
            throw new RuntimeException("Could not initialize MinIO bucket: " + e.getMessage(), e);
        }
    }

    /**
     * Upload a file and return its public URL.
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(fileName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            return minioUrl + "/" + bucket + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    /**
     * Upload a file from disk and return its public URL.
     */
    public String uploadPath(Path filePath, String folder) {
        String contentType = "application/octet-stream";
        try {
            String detectedType = Files.probeContentType(filePath);
            if (detectedType != null && !detectedType.isBlank()) {
                contentType = detectedType;
            }
        } catch (Exception ignored) {
            // Fall back to a generic binary type when probing fails.
        }
        return uploadPath(filePath, folder, contentType);
    }

    /**
     * Upload a file from disk and return its public URL.
     */
    public String uploadPath(Path filePath, String folder, String contentType) {
        try (InputStream inputStream = Files.newInputStream(filePath)) {
            String fileName = folder + "/" + UUID.randomUUID() + "_" + filePath.getFileName();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(fileName)
                    .stream(inputStream, Files.size(filePath), -1)
                    .contentType(contentType)
                    .build());
            return minioUrl + "/" + bucket + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file by its URL.
     */
    public void deleteFile(String fileUrl) {
        try {
            String objectName = fileUrl.replace(minioUrl + "/" + bucket + "/", "");
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectName).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    /**
     * Get a file as InputStream (for downloading).
     */
    public InputStream getFile(String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder().bucket(bucket).object(objectName).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get file: " + e.getMessage(), e);
        }
    }
}
