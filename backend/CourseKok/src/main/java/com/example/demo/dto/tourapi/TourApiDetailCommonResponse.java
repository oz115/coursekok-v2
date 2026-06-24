package com.example.demo.dto.tourapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Optional;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TourApiDetailCommonResponse {

    @JsonProperty("response")
    private Response response;

    public boolean isSuccessful() {
        return response != null
                && response.header != null
                && "0000".equals(response.header.resultCode);
    }

    public Optional<Item> firstItem() {
        if (response == null
                || response.body == null
                || response.body.items == null
                || response.body.items.item == null
                || response.body.items.item.isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(response.body.items.item.getFirst());
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        @JsonProperty("header")
        private Header header;

        @JsonProperty("body")
        private Body body;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Header {
        @JsonProperty("resultCode")
        private String resultCode;

        @JsonProperty("resultMsg")
        private String resultMsg;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Body {
        @JsonProperty("items")
        private Items items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Items {
        @JsonProperty("item")
        private List<Item> item;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {
        @JsonProperty("contentid")
        private String contentId;

        @JsonProperty("tel")
        private String tel;

        @JsonProperty("homepage")
        private String homepage;

        @JsonProperty("overview")
        private String overview;
    }
}
