package com.attendance.fpt.services;

import com.attendance.fpt.model.request.LocationRequest;
import com.attendance.fpt.model.response.LocationResponse;

import java.util.List;

public interface LocationService {
    LocationResponse addLocation(LocationRequest locationRequest);

    List<LocationResponse> getAllLocations();

    List<LocationResponse> getAllLocationsActive();

    LocationResponse updateLocation(Long id, LocationRequest locationRequest);

    LocationResponse deleteLocation(Long id);
} 