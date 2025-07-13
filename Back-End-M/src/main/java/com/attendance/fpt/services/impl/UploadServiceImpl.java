package com.attendance.fpt.services.impl;

import java.util.*;

import com.attendance.fpt.services.UploadService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private final Cloudinary cloudinary;

    private String uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("resource_type", "auto")
            );
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }
        List<String> allowedExtensions = Arrays.asList(".png", ".jpg", ".jpeg",".gif");
        String fileName = file.getOriginalFilename().toLowerCase();
        boolean hasValidExtension = allowedExtensions.stream().anyMatch(fileName::endsWith);

        if (!hasValidExtension) {
            throw new IllegalArgumentException("File require need end with PNG, JPG, JPEG orGIF");
        }
        return uploadImage(file);
    }
}
