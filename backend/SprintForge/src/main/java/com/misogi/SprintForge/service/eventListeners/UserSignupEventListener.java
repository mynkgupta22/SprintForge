package com.misogi.SprintForge.service.eventListeners;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.misogi.SprintForge.service.EmailService;
import com.misogi.SprintForge.service.event.UserSignupEvent;

import jakarta.mail.MessagingException;

@Component
public class UserSignupEventListener implements ApplicationListener<UserSignupEvent> {

    @Autowired
    private EmailService emailService;

    @Async
    @Override
    public void onApplicationEvent(UserSignupEvent event) {
        try {
			emailService.sendHtmlEmail(event.getEmail(), event.getSubject(), event.getName(), event.getOtp());
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
}

