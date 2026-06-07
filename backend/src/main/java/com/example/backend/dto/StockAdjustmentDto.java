package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Body for PATCH /admin/products/{id}/stock
 *
 * adjustment: positive value → add stock, negative value → remove stock.
 *             e.g.  +10 means "received 10 new units"
 *                   -3  means "remove 3 damaged/lost units"
 * reason:     free-text audit note (e.g. "Received supplier shipment").
 */
@Getter
@Setter
public class StockAdjustmentDto {
    private int adjustment;
    private String reason;
}
