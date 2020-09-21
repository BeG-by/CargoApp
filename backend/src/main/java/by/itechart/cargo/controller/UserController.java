package by.itechart.cargo.controller;

import by.itechart.cargo.dto.model_dto.user.UserInfoResponse;
import by.itechart.cargo.dto.model_dto.user.UserRequest;
import by.itechart.cargo.dto.model_dto.user.UserResponse;
import by.itechart.cargo.exception.AlreadyExistException;
import by.itechart.cargo.exception.NotFoundException;
import by.itechart.cargo.model.User;
import by.itechart.cargo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;


@RestController
@RequestMapping("/v1/api/users")
@Validated
@Slf4j
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> findAll() {
        return userService.findAll();
    }

    @PostMapping
    public ResponseEntity<String> saveOne(@RequestBody @Valid UserRequest userRequest) throws AlreadyExistException {
        userService.saveOne(userRequest);
        return ResponseEntity.ok("User has been saved");
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable long id) throws NotFoundException {
        return ResponseEntity.ok(userService.findById(id));
    }


    @GetMapping("/info")
    public ResponseEntity<UserInfoResponse> findInfo() {
        return ResponseEntity.ok(userService.findInfo());
    }

}
