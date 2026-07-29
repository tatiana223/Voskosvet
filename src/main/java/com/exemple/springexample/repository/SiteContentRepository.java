package com.exemple.springexample.repository;

import com.exemple.springexample.entity.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteContentRepository extends JpaRepository<SiteContent, String> {
}
