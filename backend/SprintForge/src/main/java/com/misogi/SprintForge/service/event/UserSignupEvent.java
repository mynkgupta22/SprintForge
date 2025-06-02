package com.misogi.SprintForge.service.event;

import org.springframework.context.ApplicationEvent;

import lombok.Data;

@Data
public class UserSignupEvent extends ApplicationEvent {
    private final String email;
    private final String subject;
    private final String name;
    private final String otp;

    public UserSignupEvent(Object source, String email, String subject, String name, String otp) {
        super(source);
        this.email = email;
        this.subject = subject;
        this.name = name;
        this.otp = otp;
    }
}