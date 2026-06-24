package com.example.demo.exception;

public class DuplicateSavedPlaceException extends RuntimeException {
    public DuplicateSavedPlaceException(String message) {
        super(message);
    }
}
