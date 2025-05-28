package com.attendance.fpt.enums;

import lombok.Getter;

@Getter
public enum ComplaintType {
    MISSED_CHECKIN("Quên Checkin"),
    MISSED_CHECKOUT("Quên Checkout"),
    WRONG_TIME("Sai Giờ"),
    WRONG_LOCATION("Sai Địa Điểm"),
    SYSTEM_ERROR("Lỗi Hệ Thống"),
    OTHER("Khác");

    private final String displayName;

    ComplaintType(String displayName) {
        this.displayName = displayName;
    }

}
