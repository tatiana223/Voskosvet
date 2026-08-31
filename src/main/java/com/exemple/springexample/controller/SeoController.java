package com.exemple.springexample.controller;

import com.exemple.springexample.repository.CandleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
public class SeoController {

    private static final String SITE_URL = "https://voskosvet.ru";
    private final CandleRepository candleRepository;

    @GetMapping(value = "/api/seo/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);
        appendUrl(xml, "/", "1.0");
        appendUrl(xml, "/catalog", "0.9");
        appendUrl(xml, "/delivery-payment", "0.6");
        appendUrl(xml, "/reviews", "0.6");

        candleRepository.findAllByAvailableTrueOrderByCreatedAtDesc().forEach(candle ->
                appendUrl(xml, "/catalog/" + escapeXml(candle.getSlug()), "0.8")
        );
        return xml.append("</urlset>").toString();
    }

    private void appendUrl(StringBuilder xml, String path, String priority) {
        xml.append("<url><loc>").append(SITE_URL).append(path).append("</loc><lastmod>")
                .append(LocalDate.now()).append("</lastmod><priority>").append(priority)
                .append("</priority></url>\n");
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}
