package com.attendance.fpt.model.request;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UploadRequest {
    private MultipartFile file;
}
