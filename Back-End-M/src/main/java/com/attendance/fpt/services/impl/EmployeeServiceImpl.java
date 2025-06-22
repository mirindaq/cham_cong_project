package com.attendance.fpt.services.impl;

import com.attendance.fpt.converter.EmployeeConverter;
import com.attendance.fpt.entity.Account;
import com.attendance.fpt.entity.Department;
import com.attendance.fpt.entity.Employee;
import com.attendance.fpt.entity.LeaveBalance;
import com.attendance.fpt.enums.EmployeeType;
import com.attendance.fpt.enums.Role;
import com.attendance.fpt.exceptions.custom.ConflictException;
import com.attendance.fpt.exceptions.custom.ResourceNotFoundException;
import com.attendance.fpt.model.request.EmployeeAddRequest;
import com.attendance.fpt.model.request.EmployeeProfileRequest;
import com.attendance.fpt.model.request.UploadRequest;
import com.attendance.fpt.model.response.EmployeeResponse;
import com.attendance.fpt.model.response.ResponseWithPagination;
import com.attendance.fpt.repositories.*;
import com.attendance.fpt.services.EmployeeService;
import com.attendance.fpt.services.UploadService;
import com.attendance.fpt.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AccountRepository accountRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;
    private final UploadService uploadService;

    @Override
    @Transactional
    public EmployeeResponse addEmployee(EmployeeAddRequest employeeAddRequest) {
        Department department = departmentRepository.findById(employeeAddRequest.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));


        if (employeeRepository.existsByEmail(employeeAddRequest.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (employeeRepository.existsByPhone(employeeAddRequest.getPhone())) {
            throw new ConflictException("Phone already exists");
        }

        Employee employee = Employee.builder()
                .fullName(employeeAddRequest.getFullName())
                .email(employeeAddRequest.getEmail())
                .phone(employeeAddRequest.getPhone())
                .address(employeeAddRequest.getAddress())
                .position(employeeAddRequest.getPosition())
                .dob(employeeAddRequest.getDob())
                .joinDate(employeeAddRequest.getJoinDate())
                .department(department)
                .employeeType(EmployeeType.valueOf(employeeAddRequest.getEmployeeType()))
                .active(true)
                .build();

        employeeRepository.save(employee);

        Account account = Account.builder()
                .username(employeeAddRequest.getEmail())
                .password(passwordEncoder.encode("1111"))
                .employee(employee)
                .role(Role.valueOf(employeeAddRequest.getRole()))
                .firstLogin(true)
                .build();

        accountRepository.save(account);


        List<LeaveBalance> leaveBalances = new ArrayList<>();
        leaveTypeRepository.findAll().forEach(leaveType -> {
            LeaveBalance leaveBalance = LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(leaveType)
                    .year(employeeAddRequest.getJoinDate().getYear())
                    .remainingDay(leaveType.getMaxDayPerYear())
                    .usedDay(0)
                    .build();
            leaveBalances.add(leaveBalance);
        });
        leaveBalanceRepository.saveAll(leaveBalances);

        employee.setAccount(account);
        employee.setLeaveBalance(leaveBalances);
        return EmployeeConverter.toResponse(employee);
    }

    @Override
    public EmployeeResponse updateEmployee(Long employeeId, EmployeeAddRequest employeeAddRequest) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!employee.getEmail().equals(employeeAddRequest.getEmail()) && employeeRepository.existsByEmail(employeeAddRequest.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (!employee.getPhone().equals(employeeAddRequest.getPhone()) && employeeRepository.existsByPhone(employeeAddRequest.getPhone())) {
            throw new ConflictException("Phone already exists");
        }

        Department department = departmentRepository.findById(employeeAddRequest.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        employee.setFullName(employeeAddRequest.getFullName());
        employee.setEmail(employeeAddRequest.getEmail());
        employee.setPhone(employeeAddRequest.getPhone());
        employee.setAddress(employeeAddRequest.getAddress());
        employee.setPosition(employeeAddRequest.getPosition());
        employee.setDob(employeeAddRequest.getDob());
        employee.setJoinDate(employeeAddRequest.getJoinDate());
        employee.setDepartment(department);
        employee.setEmployeeType(EmployeeType.valueOf(employeeAddRequest.getEmployeeType()));
        employee.setActive(employeeAddRequest.isActive());

        Account account = employee.getAccount();
        account.setUsername(employeeAddRequest.getEmail());
        account.setRole(Role.valueOf(employeeAddRequest.getRole()));

        accountRepository.save(account);
        employeeRepository.save(employee);
        return EmployeeConverter.toResponse(employee);
    }

    @Override
    public EmployeeResponse updateProfile( EmployeeProfileRequest employeeProfileRequest) {
        Employee employee = securityUtil.getCurrentUser();

        if (!employee.getPhone().equals(employeeProfileRequest.getPhone()) && employeeRepository.existsByPhone(employeeProfileRequest.getPhone())) {
            throw new ConflictException("Phone already exists");
        }
        employee.setPhone(employeeProfileRequest.getPhone());
        employee.setAddress(employeeProfileRequest.getAddress());
        employee.setDob(employeeProfileRequest.getDob());

        return EmployeeConverter.toResponse(employeeRepository.save(employee));
    }

    @Override
    public List<EmployeeResponse> getEmployeeToAssignment() {
        List<Employee> employees = employeeRepository.findAllByAccount_Role(Role.EMPLOYEE);
        if (employees != null && !employees.isEmpty()) {
            return employees.stream()
                    .map(EmployeeConverter::toResponse)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Override
    public ResponseWithPagination<List<EmployeeResponse>> getAllEmployees(
            int page,
            int limit,
            String name,
            String email,
            String phone,
            String role,
            String status,
            String departmentName
    ) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Employee> employeePage = employeeRepository.findAllWithFilters(
                name, email, phone, role != null ? Role.valueOf(role) : null, status, departmentName, pageable
        );

        List<EmployeeResponse> employeeResponses = employeePage.getContent().stream()
                .map(EmployeeConverter::toResponse)
                .collect(Collectors.toList());

        return ResponseWithPagination.<List<EmployeeResponse>>builder()
                .data(employeeResponses)
                .totalItem((int) employeePage.getTotalElements())
                .totalPage(employeePage.getTotalPages())
                .limit(limit)
                .page(employeePage.getNumber())
                .build();
    }

    @Override
    public EmployeeResponse getProfile() {
        Employee employee = securityUtil.getCurrentUser();
        return EmployeeConverter.toResponse(employee);
    }

    @Override
    public long countEmployees() {
        return employeeRepository.count();
    }

    @Override
    public EmployeeResponse updateAvatar(UploadRequest uploadRequest) {
        Employee employee = securityUtil.getCurrentUser();

        MultipartFile file = uploadRequest.getFile();
        if (file == null || file.isEmpty()) {
            throw new ConflictException("No file uploaded");
        }

        String avatarUrl = uploadService.upload(file);
        if (avatarUrl == null || avatarUrl.isBlank()) {
            throw new ConflictException("Failed to upload avatar");
        }

        employee.setAvatar(avatarUrl);
        employeeRepository.save(employee);

        return EmployeeConverter.toResponse(employee);
    }

}