package by.itechart.cargo.controller;

import by.itechart.cargo.dto.model_dto.product_owner.ProductOwnerSaveRequest;
import by.itechart.cargo.dto.model_dto.product_owner.ProductOwnerUpdateRequest;
import by.itechart.cargo.exception.AlreadyExistException;
import by.itechart.cargo.exception.NotFoundException;
import by.itechart.cargo.model.ProductOwner;
import by.itechart.cargo.service.ProductOwnerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/v1/api/owners")
@Slf4j
public class ProductOwnerController {

    private final ProductOwnerService productOwnerService;

    @Autowired
    public ProductOwnerController(ProductOwnerService productOwnerService) {
        this.productOwnerService = productOwnerService;
    }

    @GetMapping
    public ResponseEntity<List<ProductOwner>> productOwners() {
        return ResponseEntity.ok(productOwnerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductOwner> productOwner(@PathVariable Long id) throws NotFoundException {
        return ResponseEntity.ok(productOwnerService.findById(id));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProductOwner>> productOwner(@RequestParam String name) {
        return ResponseEntity.ok(productOwnerService.findByName(name));
    }

    @PutMapping
    public ResponseEntity<String> update(@RequestBody @Valid ProductOwnerUpdateRequest productOwnerUpdateRequest) throws NotFoundException, AlreadyExistException {
        productOwnerService.update(productOwnerUpdateRequest);
        return ResponseEntity.ok("Product owner has been updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) throws NotFoundException {
        productOwnerService.delete(id);
        return ResponseEntity.ok("Product owner has been deleted");
    }

    @PostMapping
    public ResponseEntity<String> save(@RequestBody @Valid ProductOwnerSaveRequest productOwner) throws NotFoundException, AlreadyExistException {
        productOwnerService.save(productOwner);
        return ResponseEntity.ok("Product owner has been saved");
    }
}
