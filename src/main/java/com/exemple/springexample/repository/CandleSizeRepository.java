package com.exemple.springexample.repository;

import com.exemple.springexample.entity.CandleSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandleSizeRepository extends JpaRepository<CandleSize, Long> {

    boolean existsByValueCm(Integer valueCm);

    List<CandleSize> findAllByOrderByValueCmAsc();
}
