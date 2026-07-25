package com.exemple.springexample.repository;

import com.exemple.springexample.entity.Candle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface CandleRepository extends JpaRepository<Candle, Long> {

    @Query("""
            select c from Candle c
            where c.available = true
              and (:categoryId is null or c.category.id = :categoryId)
              and (:featured is null or c.featured = :featured)
              and (
                    :scent is null
                    or lower(c.scent) like lower(concat('%', :scent, '%'))
              )
              and (:minPrice is null or c.price >= :minPrice)
              and (:maxPrice is null or c.price <= :maxPrice)
            """)
    Page<Candle> searchCandles(
            @Param("categoryId") Long categoryId,
            @Param("featured") Boolean featured,
            @Param("scent") String scent,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    Optional<Candle> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByCategoryId(Long categoryId);
}
