package com.restaurant.qrmenu.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisTokenStore {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String TOKEN_PREFIX = "token:";
    private static final String BLACKLIST_PREFIX = "blacklist:";

    public void storeToken(String username, String token, long expirationInSeconds) {
        String key = TOKEN_PREFIX + username;
        redisTemplate.opsForValue().set(key, token, expirationInSeconds, TimeUnit.SECONDS);
    }

    public String getToken(String username) {
        String key = TOKEN_PREFIX + username;
        return (String) redisTemplate.opsForValue().get(key);
    }

    public void removeToken(String username) {
        String key = TOKEN_PREFIX + username;
        redisTemplate.delete(key);
    }

    public void addToBlacklist(String token, long expirationInSeconds) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.opsForValue().set(key, "blacklisted", expirationInSeconds, TimeUnit.SECONDS);
    }

    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        return redisTemplate.hasKey(key);
    }

    public void clearBlacklist() {
        redisTemplate.keys(BLACKLIST_PREFIX + "*").forEach(redisTemplate::delete);
    }
} 