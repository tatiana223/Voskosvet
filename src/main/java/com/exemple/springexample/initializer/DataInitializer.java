package com.exemple.springexample.initializer;

import com.exemple.springexample.entity.Candle;
import com.exemple.springexample.entity.Category;
import com.exemple.springexample.entity.Customer;
import com.exemple.springexample.entity.Role;
import com.exemple.springexample.repository.CandleRepository;
import com.exemple.springexample.repository.CategoryRepository;
import com.exemple.springexample.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.math.BigDecimal;

@Profile("dev")
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final CandleRepository candleRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminAccount();

        if (candleRepository.count() > 0) {
            return;
        }

        Category aroma = createCategory(
                "Ароматические свечи",
                "Свечи с уютными ароматами для дома, отдыха и подарков"
        );

        Category interior = createCategory(
                "Интерьерные свечи",
                "Декоративные свечи для красивого пространства"
        );

        Category gift = createCategory(
                "Подарочные наборы",
                "Готовые наборы свечей для близких и особых случаев"
        );

        createCandle(
                "vanilla-cloud",
                "Ванильное облако",
                "Нежная соевая свеча с теплым ароматом ванили, сливок и мягкой карамели.",
                "Теплая ванильная свеча для уютных вечеров.",
                new BigDecimal("890.00"),
                "Ваниль",
                "Молочный",
                180,
                35,
                true,
                "/images/candle-detail.png",
                aroma
        );

        createCandle(
                "lavender-evening",
                "Лавандовый вечер",
                "Спокойный аромат лаванды для вечернего отдыха и расслабления.",
                "Теплая ванильная свеча для уютных вечеров.",
                new BigDecimal("950.00"),
                "Лаванда",
                "Сиреневый",
                200,
                40,
                true,
                "/images/about-natural-candle.png",
                aroma
        );

        createCandle(
                "warm-cashmere",
                "Теплый кашемир",
                "Глубокий уютный аромат с нотами мускуса, дерева и чистого хлопка.",
                "Теплая ванильная свеча для уютных вечеров.",
                new BigDecimal("1190.00"),
                "Кашемир",
                "Бежевый",
                220,
                45,
                false,
                "/images/hero-natural-candle.png",
                aroma
        );

        createCandle(
                "marble-column",
                "Мраморная колонна",
                "Интерьерная свеча с лаконичной формой и мраморным эффектом.",
                "Теплая ванильная свеча для уютных вечеров.",
                new BigDecimal("1290.00"),
                "Без аромата",
                "Белый мрамор",
                300,
                50,
                false,
                "/images/candle-size.png",
                interior
        );

        createCandle(
                "cozy-home-set",
                "Подарочный набор Cozy Home",
                "Набор из трех мини-свечей с ароматами ванили, лаванды и хлопка.",
                "Теплая ванильная свеча для уютных вечеров.",
                new BigDecimal("1890.00"),
                "Ассорти",
                "Нежные оттенки",
                360,
                60,
                false,
                "/images/gift-box.png",
                gift
        );
    }

    private void createAdminAccount() {
        String email = "admin@voskosvet.ru";

        if (customerRepository.existsByEmail(email)) {
            return;
        }

        Customer admin = new Customer();
        admin.setFullName("Администратор ВоскоСвет");
        admin.setPhone("+7 900 000-00-00");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        customerRepository.save(admin);
    }

    private Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    private void createCandle(
            String slug,
            String name,
            String description,
            String shortDescription,
            BigDecimal price,
            String scent,
            String color,
            Integer weightGrams,
            Integer burnTimeHours,
            Boolean featured,
            String imageUrl,
            Category category
    ) {
        Candle candle = new Candle();
        candle.setSlug(slug);
        candle.setName(name);
        candle.setDescription(description);
        candle.setShortDescription(shortDescription);
        candle.setPrice(price);
        candle.setScent(scent);
        candle.setColor(color);
        candle.setWeightGrams(weightGrams);
        candle.setBurnTimeHours(burnTimeHours);
        candle.setFeatured(featured);
        candle.setImageUrl(imageUrl);
        candle.setAvailable(true);
        candle.setCategory(category);

        candleRepository.save(candle);
    }
}
