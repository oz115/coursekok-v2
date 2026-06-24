package com.example.demo.repository;

import com.example.demo.entity.ClassificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClassificationCodeRepository extends JpaRepository<ClassificationCode, Long> {
    
    @Query("SELECT c FROM ClassificationCode c WHERE " +
           "(c.lclsSystm1 = :s1 OR (c.lclsSystm1 IS NULL AND :s1 IS NULL)) AND " +
           "(c.lclsSystm2 = :s2 OR (c.lclsSystm2 IS NULL AND :s2 IS NULL)) AND " +
           "(c.lclsSystm3 = :s3 OR (c.lclsSystm3 IS NULL AND :s3 IS NULL))")
    Optional<ClassificationCode> findUnique(@Param("s1") String s1, @Param("s2") String s2, @Param("s3") String s3);

    Optional<ClassificationCode> findByLclsSystm1AndLclsSystm2AndLclsSystm3(String lclsSystm1, String lclsSystm2, String lclsSystm3);
}
