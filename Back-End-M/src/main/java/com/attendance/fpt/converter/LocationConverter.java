package com.attendance.fpt.converter;

import com.attendance.fpt.entity.Location;
import com.attendance.fpt.model.response.LocationResponse;

public class LocationConverter {

    public static LocationResponse toResponse (Location location){
        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .address(location.getAddress())
                .country(location.getCountry())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .radius(location.getRadius())
                .active(location.isActive())
                .build();
    }
}
