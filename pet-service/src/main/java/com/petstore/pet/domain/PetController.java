package com.petstore.pet.domain;

import com.petstore.pet.common.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pets")
@Tag(name = "Pets")
public class PetController {

    private final PetService pets;

    public PetController(PetService pets) {
        this.pets = pets;
    }

    @GetMapping
    public PageResponse<PetResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return pets.list(PageRequest.of(page, Math.min(size, 50), Sort.by("id").descending()));
    }

    @GetMapping("/{id}")
    public PetResponse get(@PathVariable Long id) {
        return pets.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetResponse create(@Valid @RequestBody PetRequest request) {
        return pets.create(request);
    }

    @PutMapping("/{id}")
    public PetResponse update(@PathVariable Long id, @Valid @RequestBody PetRequest request) {
        return pets.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        pets.delete(id);
    }
}
