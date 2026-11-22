package com.successfarms.api.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 255) String category,
        @NotBlank @Size(max = 1000) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        @Min(0) int stock,
        @Size(max = 1000) String imageUrl) {
}
