package by.itechart.cargo.controller;

import by.itechart.cargo.dto.model_dto.user.*;
import by.itechart.cargo.exception.AlreadyExistException;
import by.itechart.cargo.exception.IncorrectPasswordException;
import by.itechart.cargo.exception.NotFoundException;
import by.itechart.cargo.exception.ServiceException;
import by.itechart.cargo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

import static by.itechart.cargo.security.RoleConstant.*;


@RestController
@RequestMapping("/v1/api/users")
@Validated
@Slf4j
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Secured({ADMIN, OWNER})
    public List<UserResponse> findAll() {
        return userService.findAll();
    }

    @PostMapping
    @Secured({ADMIN, OWNER})
    public ResponseEntity<String> sendLink(@RequestBody @Valid ActivationDetailsRequest request) throws AlreadyExistException, ServiceException {
        userService.sendActivationLink(request);
        return ResponseEntity.ok("Link has been sent");
    }

    @GetMapping("/{id}")
    @Secured({ADMIN, OWNER, DRIVER, DISPATCHER, MANAGER})
    public ResponseEntity<UserResponse> findById(@PathVariable long id) throws NotFoundException {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping
    @Secured({ADMIN, OWNER})
    public ResponseEntity<String> update(@RequestBody @Valid UserUpdateRequest userUpdateRequest) throws NotFoundException {
        userService.update(userUpdateRequest);
        return ResponseEntity.ok("User has been updated");
    }

    @PutMapping("/photo")
    public ResponseEntity<String> updatePhoto(@RequestBody @Valid PhotoRequest photoRequest)
            throws NotFoundException {
        userService.updatePhoto(photoRequest, -1);
        return ResponseEntity.ok("Photo has been updated");
    }

    @PutMapping("/photo/{id}")
    @Secured({ADMIN, OWNER})
    public ResponseEntity<String> updatePhoto(@RequestBody @Valid PhotoRequest photoRequest, @PathVariable long id)
            throws NotFoundException {
        userService.updatePhoto(photoRequest, id);
        return ResponseEntity.ok("User's photo with has been updated");
    }


    @PutMapping("/phone")
    public ResponseEntity<String> updatePhone(@RequestBody @Valid PhoneRequest phoneRequest)
            throws NotFoundException {
        userService.updatePhone(phoneRequest);
        return ResponseEntity.ok("Phone has been updated");
    }

    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(@RequestBody @Valid PasswordRequest passwordRequest)
            throws IncorrectPasswordException {
        userService.updatePassword(passwordRequest);
        return ResponseEntity.ok("Phone has been updated");
    }

    @GetMapping("/info")
    public ResponseEntity<UserInfoResponse> findInfo() {
        return ResponseEntity.ok(userService.findInfo());
    }

    @DeleteMapping("/{id}")
    @Secured({ADMIN, OWNER})
    public ResponseEntity<String> delete(@PathVariable long id) throws NotFoundException {
        userService.delete(id);
        return ResponseEntity.ok("User has been deleted");
    }

}
