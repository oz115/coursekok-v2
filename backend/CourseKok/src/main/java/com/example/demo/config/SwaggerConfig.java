package com.example.demo.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI courseKokOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("CourseKok API")
                        .description("""
                                ## CourseKok - 여행 코스 공유 플랫폼 API
                                
                                한국관광공사 TourAPI 기반 여행지 탐색, AI 기반 일정 스케줄러,
                                여행기(TripLog) 매거진 공유 커뮤니티 서비스의 RESTful API 명세서입니다.
                                
                                ### 인증 방식
                                - JWT Bearer Token 사용
                                - 우측 상단 `Authorize` 버튼 클릭 후 `Bearer {token}` 형식으로 입력
                                """)
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("CourseKok Dev Team")
                                .email("dev@coursekok.com")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT 인증 토큰. 형식: Bearer {accessToken}")));
    }
}
