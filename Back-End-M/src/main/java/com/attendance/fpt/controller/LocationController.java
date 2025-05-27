package com.attendance.fpt.controller;
import com.attendance.fpt.model.request.LocationRequest;
import com.attendance.fpt.model.response.LocationResponse;
import com.attendance.fpt.model.response.ResponseSuccess;
import com.attendance.fpt.services.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/locations")
public class LocationController {

    private final LocationService locationService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<LocationResponse>>> getAllLocations() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all locations success",
                locationService.getAllLocations()
        ));
    }

    @GetMapping("/active")
    public ResponseEntity<ResponseSuccess<List<LocationResponse>>> getAllLocationsActive() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Get all locations success",
                locationService.getAllLocationsActive()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<LocationResponse>> addLocation(@Valid @RequestBody LocationRequest locationRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.CREATED,
                "Add location success",
                locationService.addLocation(locationRequest)
        ));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseSuccess<LocationResponse>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest locationRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Update location success",
                locationService.updateLocation(id, locationRequest)
        ));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseSuccess<LocationResponse>> deleteLocation(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                HttpStatus.OK,
                "Delete location success",
                locationService.deleteLocation(id)
        ));
    }

}
