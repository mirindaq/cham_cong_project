package com.attendance.fpt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả các API
                .allowedOrigins("http://localhost:5173") // Thay bằng domain của front-end
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các method được phép
                .allowedHeaders("*") // Chấp nhận mọi header
                .allowCredentials(true); // Nếu cần gửi cookies hoặc thông tin xác thực
    }
}