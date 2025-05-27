package com.attendance.fpt.services.impl;

import com.attendance.fpt.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@RequiredArgsConstructor
@Service
@Slf4j(topic = "EMAIL-SERVICE")
public class EmailServiceImpl implements EmailService {
    public static final String UTF_8_ENCODING = "UTF-8";
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async("taskExecutor")
    public void sendNewPassword(String to, String newPassword) {
        try {
            Context context = new Context();
            context.setVariable("newPassword", newPassword);
            String text = templateEngine.process("new-password", context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, UTF_8_ENCODING);

            helper.setPriority(1);
            helper.setSubject("Mật khẩu mới của bạn");
            helper.setFrom(fromEmail);
            helper.setTo(to);

            helper.setText(text, true);
            mailSender.send(message);
            log.info("Đã gửi email mật khẩu mới thành công đến: {}", to);
        } catch (MessagingException exception) {
            log.error("Lỗi khi gửi email mật khẩu mới: {}", exception.getMessage());
            if (exception.getMessage().contains("Recipient address rejected")) {
                throw new RuntimeException("Địa chỉ email không tồn tại");
            } else {
                throw new RuntimeException("Không thể gửi email mật khẩu mới: " + exception.getMessage());
            }
        } catch (Exception exception) {
            throw new RuntimeException("Có lỗi xảy ra khi gửi email: " + exception.getMessage());
        }
    }
}
