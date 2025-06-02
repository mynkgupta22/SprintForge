package com.misogi.SprintForge.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.misogi.SprintForge.service.TokenBlacklistService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenBlacklistServiceImpl implements TokenBlacklistService {
//    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.expiration}")
    private long jwtExpirationMillis;

    private static final String BLACKLIST_PREFIX = "blacklisted_token:";

    @Override
    public void blacklistToken(String token) {
//        redisTemplate.opsForValue().set(BLACKLIST_PREFIX + token, "true", jwtExpirationMillis, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
//        return redisTemplate.hasKey(BLACKLIST_PREFIX + token);
    	return true;
    }
} 