package com.attendance.fpt.controller;

import com.attendance.fpt.model.request.UploadRequest;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/uploads")
public class UploadController {
    private final UploadService uploadService;

    @PostMapping(value = "/upload",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_ADMIN')")
    public ResponseEntity<ResponseSuccess<String>> upload(@ModelAttribute UploadRequest uploadRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(HttpStatus.OK,
                "Upload image success", uploadService.upload(uploadRequest.getFile())));
    }
}
