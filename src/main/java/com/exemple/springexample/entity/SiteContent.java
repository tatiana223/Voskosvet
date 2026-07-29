package com.exemple.springexample.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "site_content")
public class SiteContent {
    @Id
    @Column(name = "content_key", length = 100)
    private String key;

    @Column(name = "content_value", nullable = false, columnDefinition = "TEXT")
    private String value;
}
