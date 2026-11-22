package com.successfarms.api.product;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductDataInitializer implements CommandLineRunner {
    private final ProductRepository products;

    public ProductDataInitializer(ProductRepository products) {
        this.products = products;
    }

    @Override
    public void run(String... args) {
        if (products.count() > 0) {
            return;
        }

        products.saveAll(List.of(
                new Product("Heirloom Tomatoes", "Fresh produce",
                        "Sun-ripened, hand-picked heirloom tomatoes bursting with flavor.",
                        new BigDecimal("4.99"), 32,
                        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=960&q=85"),
                new Product("Garden Greens", "Fresh produce",
                        "A crisp, seasonal mix of tender baby greens, harvested this morning.",
                        new BigDecimal("3.49"), 24,
                        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=960&q=85"),
                new Product("Farmhouse Strawberries", "Fruit",
                        "Sweet, fragrant strawberries grown slowly and picked at their peak.",
                        new BigDecimal("5.99"), 18,
                        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=960&q=85"),
                new Product("Golden Honey", "Pantry",
                        "Small-batch wildflower honey from our own thriving farm hives.",
                        new BigDecimal("12.00"), 15,
                        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=960&q=85"),
                new Product("Organic Carrots", "Fresh produce",
                        "Naturally sweet, earth-grown carrots, bundled fresh from the field.",
                        new BigDecimal("2.99"), 41,
                        "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=960&q=85"),
                new Product("Sourdough Loaf", "Bakery",
                        "Slow-fermented farmhouse sourdough with a golden, crackling crust.",
                        new BigDecimal("7.50"), 12,
                        "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=960&q=85")));
    }
}
