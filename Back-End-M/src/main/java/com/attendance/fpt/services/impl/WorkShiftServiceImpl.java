package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.WorkShiftConverter;
import com.attendance.fpt.entity.WorkShift;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.WorkShiftRequest;
import com.attendance.fpt.model.response.WorkShiftResponse;
import com.attendance.fpt.repositories.WorkShiftRepository;
import com.attendance.fpt.services.WorkShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkShiftServiceImpl implements WorkShiftService {

    private final WorkShiftRepository workShiftRepository;

    @Override
    public List<WorkShiftResponse> getAllWorkShifts() {
        return workShiftRepository.findAll().stream()
                .map(WorkShiftConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WorkShiftResponse addWorkShift(WorkShiftRequest workShiftRequest) {
        WorkShift workShift = new WorkShift();
        workShift.setName(workShiftRequest.getName());
        workShift.setStartTime(LocalTime.parse(workShiftRequest.getStartTime()));
        workShift.setEndTime(LocalTime.parse(workShiftRequest.getEndTime()));

        return WorkShiftConverter.toResponse(workShiftRepository.save(workShift));
    }

    @Override
    public WorkShiftResponse deleteWorkShift(Long id) {
        WorkShift workShift = workShiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work shift not found"));

        if (workShiftRepository.workShiftHaveAssignments(id)) {
            throw new ConflictException("Cannot delete work shift with existing assignments");
        }
        workShiftRepository.delete(workShift);
        return WorkShiftConverter.toResponse(workShift);
    }

}