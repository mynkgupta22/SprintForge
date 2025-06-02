package com.misogi.SprintForge.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
	private String email;

    public void sendHtmlEmail(String to, String subject, String userName, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: auto; background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);'>" +
                "<h2 style='color: #2196F3;'>🔐 FormBuilder Email Verification</h2>" +
                "<p style='font-size: 16px;'>Hello <strong>" + userName + "</strong>,</p>" +
                "<p>Your OTP for completing the signup process is:</p>" +
                "<div style='font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4CAF50; margin: 20px 0;'>" + otp + "</div>" +
                "<p style='font-size: 14px;'>Please enter this OTP within 5 minutes to verify your email address.</p>" +
                "<hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />" +
                "<p style='font-size: 14px; color: #888;'>Need help? Contact us at <a href='mailto:support@formbuilder.com'>support@formbuilder.com</a></p>" +
                "</div>" +
                "</body></html>";

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = isHtml
        helper.setFrom(email);

        mailSender.send(message);
    }

}