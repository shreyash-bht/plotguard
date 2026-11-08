package com.plotguard.api.login.service;

import com.plotguard.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class UsernameGeneratorService {
    @Autowired
    private UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    private static final String[] ADJECTIVES = {
            "Silent", "Crimson", "Shadow", "Mystic",
            "Cosmic", "Lunar", "Eternal", "Phantom",
            "Blazing", "Fallen", "Azure", "Cursed"
    };

    private static final String[] NOUNS = {
            "Shinobi", "Ronin", "Titan", "Samurai",
            "Dragon", "Senpai", "Wanderer", "Raven",
            "Kitsune", "Sage", "Shogun", "Phantom"
    };

    public String generateUsername() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String username = generateCandidate();

            if (!userRepository.existsByUsername(username)) {
                return username;
            }
        }

        throw new IllegalStateException(
                "Unable to generate a unique username"
        );
    }

    private String generateCandidate() {
        String adjective = ADJECTIVES[random.nextInt(ADJECTIVES.length)];
        String noun = NOUNS[random.nextInt(NOUNS.length)];
        int number = random.nextInt(9000) + 1000;
        return adjective + noun + number;
    }
}
