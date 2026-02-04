package com.neurofleetx.trip.util;

public class PriceCalculator {

    private static final double BASE_RATE_PER_KM = 30.0;
    private static final double ONE_WAY_SURCHARGE_PERCENTAGE = 0.40;

    public static double calculatePrice(double distanceKm, String tripType) {
        double basePrice = distanceKm * BASE_RATE_PER_KM;

        if ("ONE_WAY".equalsIgnoreCase(tripType)) {
            basePrice += basePrice * ONE_WAY_SURCHARGE_PERCENTAGE;
        }

        return Math.round(basePrice * 100.0) / 100.0; // Round to 2 decimal places
    }
}
