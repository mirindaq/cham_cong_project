
package com.attendance.fpt.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LocationResponse {
    private Long id;
    private String name;
    private String address;
    private String country;
    private Double latitude;
    private Double longitude;
    private Long radius;
    private boolean active;
} 