package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AccessLevel;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "classification_codes")
public class ClassificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lcls_systm_1", length = 10)
    private String lclsSystm1;

    @Column(name = "lcls_systm_2", length = 10)
    private String lclsSystm2;

    @Column(name = "lcls_systm_3", length = 10)
    private String lclsSystm3;

    @Column(name = "code_name", length = 255, nullable = false)
    private String name;

    /**
     * Helper method for constructing an entity.
     */
    public static ClassificationCode of(String s1, String s2, String s3, String name) {
        return ClassificationCode.builder()
                .lclsSystm1(s1)
                .lclsSystm2(s2)
                .lclsSystm3(s3)
                .name(name)
                .build();
    }
}
