package com.attendance.fpt.services;

import org.springframework.web.multipart.MultipartFile;


public interface UploadService {
    String upload(MultipartFile file);
}
