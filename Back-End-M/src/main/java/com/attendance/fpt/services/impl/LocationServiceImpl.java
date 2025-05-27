package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.LocationConverter;
import com.attendance.fpt.entity.Location;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.LocationRequest;
import com.attendance.fpt.model.response.LocationResponse;
import com.attendance.fpt.repositories.LocationRepository;
import com.attendance.fpt.services.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

     private final LocationRepository locationRepository;

    @Override
    @Transactional
    public LocationResponse addLocation(LocationRequest locationRequest) {
        Location location = Location.builder()
                .name(locationRequest.getName())
                .address(locationRequest.getAddress())
                .latitude(locationRequest.getLatitude())
                .longitude(locationRequest.getLongitude())
                .radius(locationRequest.getRadius())
                .country(locationRequest.getCountry())
                .active(locationRequest.isActive())
                .build();
        return LocationConverter.toResponse(locationRepository.save(location));
    }

    @Override
    public List<LocationResponse> getAllLocations() {
        List<Location> locations = locationRepository.findAll();

        if (locations.isEmpty()) {
            return List.of();
        }

        return locations.stream()
                .map(LocationConverter::toResponse)
                .toList();
    }

    @Override
    public List<LocationResponse> getAllLocationsActive() {
        List<Location> locations = locationRepository.findByActive(true);

        if (locations.isEmpty()) {
            return List.of();
        }

        return locations.stream()
                .map(LocationConverter::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest locationRequest) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        location.setName(locationRequest.getName());
        location.setAddress(locationRequest.getAddress());
        location.setLatitude(locationRequest.getLatitude());
        location.setLongitude(locationRequest.getLongitude());
        location.setRadius(locationRequest.getRadius());
        location.setCountry(locationRequest.getCountry());
        location.setActive(locationRequest.isActive());

        return LocationConverter.toResponse(locationRepository.save(location));
    }

    @Override
    public LocationResponse deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        if ( location.getAttendances() != null && !location.getAttendances().isEmpty()) {
            throw new ConflictException("Cannot delete location with existing attendances");
        }

        locationRepository.deleteById(id);
        return LocationConverter.toResponse(location);
    }
}