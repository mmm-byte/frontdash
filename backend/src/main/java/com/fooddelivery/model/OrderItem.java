package com.fooddelivery.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * OrderItem Entity - Maps to OrderItem table in database
 * Represents items within an order (composite primary key)
 */
@Entity
@Table(name = "OrderItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@IdClass(OrderItem.OrderItemId.class)
public class OrderItem {

    @Id
    @Column(name = "orderID_formatted_fk", length = 20)
    private String orderIdFk;

    @Id
    @Column(name = "itemID_fk")
    private Integer itemIdFk;

    @Column(name = "item_name_snapshot", nullable = false, length = 255)
    private String itemNameSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceSnapshot;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "item_subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal itemSubtotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderID_formatted_fk", insertable = false, updatable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemID_fk", insertable = false, updatable = false)
    private MenuItem menuItem;

    /**
     * Composite Primary Key class for OrderItem
     * Field order must match the @Id field declaration order in the entity
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class OrderItemId implements Serializable {
        private String orderIdFk;
        private Integer itemIdFk;
    }
}
