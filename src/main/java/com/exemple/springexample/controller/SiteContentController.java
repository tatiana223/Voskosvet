package com.exemple.springexample.controller;

import com.exemple.springexample.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SiteContentController {
    private final SiteContentService siteContentService;

    @GetMapping("/api/content")
    public Map<String, String> getContent() {
        return siteContentService.getAll();
    }

    @GetMapping("/api/admin/content")
    public Map<String, String> getAdminContent() {
        return siteContentService.getAll();
    }

    @PutMapping("/api/admin/content")
    public Map<String, String> updateContent(@RequestBody Map<String, String> values) {
        return siteContentService.update(values);
    }
}
