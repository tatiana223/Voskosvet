package com.exemple.springexample.service;

import com.exemple.springexample.entity.SiteContent;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.repository.SiteContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteContentService {
    private static final Set<String> ALLOWED_KEYS = Set.of(
            "home.heroTitle", "home.heroSubtitle", "home.heroButton",
            "home.heroImage", "home.point1", "home.point2", "home.point3",
            "home.ribbon1", "home.ribbon2", "home.ribbon3", "home.ribbon4",
            "home.aboutEyebrow", "home.aboutTitle", "home.aboutText",
            "home.aboutImage1", "home.aboutCaption1",
            "home.aboutImage2", "home.aboutCaption2",
            "home.aboutImage3", "home.aboutCaption3",
            "delivery.eyebrow", "delivery.title",
            "delivery.option1Title", "delivery.option1Text", "delivery.option1Term", "delivery.option1Note",
            "delivery.option2Title", "delivery.option2Text", "delivery.option2Term", "delivery.option2Note",
            "delivery.option3Title", "delivery.option3Text", "delivery.option3Term", "delivery.option3Note",
            "delivery.options",
            "delivery.paymentEyebrow", "delivery.paymentTitle", "delivery.paymentText",
            "delivery.returnsTitle", "delivery.returnsText", "delivery.returnsConditions",
            "craft.eyebrow", "craft.title", "craft.intro", "craft.steps",
            "craft.benefitsTitle", "craft.benefitsText", "craft.burningTitle", "craft.burningText",
            "craft.faq1Question", "craft.faq1Answer", "craft.faq2Question", "craft.faq2Answer",
            "craft.faq3Question", "craft.faq3Answer",
            "contacts.eyebrow", "contacts.title", "contacts.intro", "contacts.phone",
            "contacts.email", "contacts.address", "contacts.legalName", "contacts.inn", "contacts.ogrn"
    );

    private final SiteContentRepository repository;

    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(
                        SiteContent::getKey,
                        SiteContent::getValue,
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ));
    }

    @Transactional
    public Map<String, String> update(Map<String, String> values) {
        if (values.size() > ALLOWED_KEYS.size() || !ALLOWED_KEYS.containsAll(values.keySet())) {
            throw new BadRequestException("Переданы неизвестные поля контента");
        }

        values.forEach((key, value) -> {
            String normalized = value == null ? "" : value.trim();
            if (normalized.length() > 5000) {
                throw new BadRequestException("Текст одного поля не должен превышать 5000 символов");
            }

            SiteContent content = repository.findById(key).orElseGet(SiteContent::new);
            content.setKey(key);
            content.setValue(normalized);
            repository.save(content);
        });

        return getAll();
    }
}
