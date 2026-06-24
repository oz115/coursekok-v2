package com.example.demo.service;

import com.example.demo.entity.Place;
import com.example.demo.dto.common.PageResponse;
import com.example.demo.dto.place.PlaceResponse;
import com.example.demo.dto.place.PlaceSummaryResponse;
import com.example.demo.dto.place.RegionDto;
import com.example.demo.repository.PlaceRepository;
import com.example.demo.repository.RegionCodeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final RegionCodeRepository regionCodeRepository;

    public PlaceService(PlaceRepository placeRepository, RegionCodeRepository regionCodeRepository) {
        this.placeRepository = placeRepository;
        this.regionCodeRepository = regionCodeRepository;
    }

    /**
     * 필터 조건과 정렬 방식에 따른 관광지 목록 페이징 조회
     */
    public PageResponse<PlaceSummaryResponse> searchPlaces(
            String keyword,
            String ldongRegnCd,
            String ldongSignguCd,
            Integer contentTypeId,
            String sortBy,
            int page,
            int size
    ) {
        // 정렬 조건 빌드
        Sort sort;
        if ("rating".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            // 기본값 또는 "views"는 조회수 내림차순(추천순)
            sort = Sort.by(Sort.Direction.DESC, "views").and(Sort.by(Sort.Direction.DESC, "id"));
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Place> placePage = placeRepository.searchPlaces(keyword, ldongRegnCd, ldongSignguCd, contentTypeId, pageable);

        List<PlaceSummaryResponse> content = placePage.getContent().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                placePage.getNumber(),
                placePage.getSize(),
                placePage.getTotalElements(),
                placePage.getTotalPages(),
                placePage.isLast()
        );
    }

    /**
     * 특정 관광지 상세 조회
     */
    public PlaceResponse getPlaceDetail(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소 ID입니다: " + id));

        return toDetailResponse(place);
    }

    /**
     * 모든 시도 목록 조회
     */
    public List<RegionDto> getSidos() {
        return regionCodeRepository.findDistinctSidos();
    }

    /**
     * 특정 시도 하위의 시군구 목록 조회
     */
    public List<RegionDto> getSigungus(String sidoCode) {
        return regionCodeRepository.findSigungusBySidoCode(sidoCode);
    }

    private PlaceSummaryResponse toSummaryResponse(Place p) {
        return new PlaceSummaryResponse(
                p.getId(),
                p.getContentTypeId(),
                p.getTitle(),
                p.getAddress(),
                p.getRegionCode().getLdongRegnNm(),
                p.getRegionCode().getLdongSignguNm(),
                p.getMapX(),
                p.getMapY(),
                p.getFirstImage2(),
                p.getViews(),
                p.getRating()
        );
    }

    private PlaceResponse toDetailResponse(Place p) {
        return new PlaceResponse(
                p.getId(),
                p.getContentId(),
                p.getContentTypeId(),
                p.getTitle(),
                p.getAddress(),
                p.getRegionCode().getLdongRegnCd(),
                p.getRegionCode().getLdongSignguCd(),
                p.getRegionCode().getLdongRegnNm(),
                p.getRegionCode().getLdongSignguNm(),
                p.getLclsSystm1(),
                p.getLclsSystm2(),
                p.getLclsSystm3(),
                p.getMapX(),
                p.getMapY(),
                p.getFirstImage(),
                p.getFirstImage2(),
                p.getCpyrhtDivCd(),
                p.getTel(),
                p.getHomepage(),
                p.getOverview(),
                p.getViews(),
                p.getRating(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
