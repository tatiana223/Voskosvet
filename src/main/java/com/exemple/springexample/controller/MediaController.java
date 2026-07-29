package com.exemple.springexample.controller;

import com.exemple.springexample.entity.MediaFile;
import com.exemple.springexample.exception.BadRequestException;
import com.exemple.springexample.exception.NotFoundException;
import com.exemple.springexample.repository.MediaFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
public class MediaController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    private final MediaFileRepository mediaFileRepository;

    @PostMapping(value = "/api/admin/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@RequestPart("file") MultipartFile file) throws IOException {
        return save(file);
    }

    @PostMapping(value = "/api/review-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadReviewImage(@RequestPart("file") MultipartFile file) throws IOException {
        return save(file);
    }

    private Map<String, String> save(MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Выберите изображение JPG, PNG или WebP");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Изображение должно быть не больше 5 МБ");
        }

        MediaFile mediaFile = new MediaFile();
        mediaFile.setContentType(file.getContentType());
        mediaFile.setOriginalName(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        mediaFile.setData(file.getBytes());

        MediaFile saved = mediaFileRepository.save(mediaFile);
        return Map.of("url", "/api/media/" + saved.getId());
    }

    @GetMapping("/api/media/{id}")
    public ResponseEntity<byte[]> get(@PathVariable Long id) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Изображение не найдено"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mediaFile.getContentType()))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .body(mediaFile.getData());
    }
}
