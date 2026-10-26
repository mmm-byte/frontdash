package com.fooddelivery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Class
 * This starts the entire Food Delivery Backend Server
 */
@SpringBootApplication
public class FoodDeliveryApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodDeliveryApplication.class, args);
        System.out.println("\n╔════════════════════════════════════════════════╗");
        System.out.println("║  Food Delivery Backend Started Successfully!  ║");
        System.out.println("║  Server running on: http://localhost:8080     ║");
        System.out.println("║  API Base URL: http://localhost:8080/api      ║");
        System.out.println("╚════════════════════════════════════════════════╝\n");
    }
}
