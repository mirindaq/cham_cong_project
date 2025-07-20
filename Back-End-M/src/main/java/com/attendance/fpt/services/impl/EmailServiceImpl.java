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
    public void sendOtp(String to, String otp) {
        try {
            Context context = new Context();
            context.setVariable("otpCode", otp);
            String text = templateEngine.process("new-password", context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, UTF_8_ENCODING);

            helper.setPriority(1);
            helper.setSubject("Mã xác thực OTP của bạn");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setText(text, true);

            mailSender.send(message);
            log.info("Đã gửi email OTP thành công đến: {}", to);
        } catch (MessagingException exception) {
            log.error("Lỗi khi gửi email OTP: {}", exception.getMessage());
            if (exception.getMessage().contains("Recipient address rejected")) {
                throw new RuntimeException("Địa chỉ email không tồn tại");
            } else {
                throw new RuntimeException("Không thể gửi email OTP: " + exception.getMessage());
            }
        } catch (Exception exception) {
            throw new RuntimeException("Có lỗi xảy ra khi gửi email OTP: " + exception.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void sendApprovalEmail(String to, String message, boolean isApproved) {
        try {
            // Tạo context cho mẫu email
            Context context = new Context();
            context.setVariable("messageContent", message);

            // Xử lý template email tùy theo trạng thái đơn
            String templateName = isApproved ? "order-approval" : "order-rejection";
            String subject = isApproved ? "Thông báo: Đơn của bạn đã được duyệt" : "Thông báo: Đơn của bạn bị từ chối";

            String text = templateEngine.process(templateName, context);

            MimeMessage mineMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mineMessage, true, UTF_8_ENCODING);

            helper.setPriority(1);
            helper.setSubject(subject);
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setText(text, true);

            // Gửi email
            mailSender.send(mineMessage);
            log.info("Đã gửi email thông báo tình trạng đơn đến: {}", to);
        } catch (MessagingException exception) {
            log.error("Lỗi khi gửi email thông báo tình trạng đơn: {}", exception.getMessage());
            if (exception.getMessage().contains("Recipient address rejected")) {
                throw new RuntimeException("Địa chỉ email không tồn tại");
            } else {
                throw new RuntimeException("Không thể gửi email thông báo tình trạng đơn: " + exception.getMessage());
            }
        } catch (Exception exception) {
            throw new RuntimeException("Có lỗi xảy ra khi gửi email thông báo tình trạng đơn: " + exception.getMessage());
        }
    }

    @Override
    @Async("taskExecutor")
    public void sendReminderEmail(String to, String message) {
        try {
            Context context = new Context();
            context.setVariable("messageContent", message);

            String text = templateEngine.process("reminder-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, UTF_8_ENCODING);

            helper.setPriority(1);
            helper.setSubject("Nhắc nhở: Sắp đến ca làm việc của bạn");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setText(text, true);

            mailSender.send(mimeMessage);
            log.info("Đã gửi email nhắc nhở thành công đến: {}", to);
        } catch (MessagingException exception) {
            log.error("Lỗi khi gửi email nhắc nhở: {}", exception.getMessage());
            if (exception.getMessage().contains("Recipient address rejected")) {
                throw new RuntimeException("Địa chỉ email không tồn tại");
            } else {
                throw new RuntimeException("Không thể gửi email nhắc nhở: " + exception.getMessage());
            }
        } catch (Exception exception) {
            throw new RuntimeException("Có lỗi xảy ra khi gửi email nhắc nhở: " + exception.getMessage());
        }
    }



}
