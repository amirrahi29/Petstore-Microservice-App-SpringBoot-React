package com.petstore.pet.domain;

import com.petstore.pet.common.NotFoundException;
import com.petstore.pet.common.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PetService {

    private final PetRepository pets;

    public PetService(PetRepository pets) {
        this.pets = pets;
    }

    public PageResponse<PetResponse> list(Pageable pageable) {
        return PageResponse.of(pets.findAll(pageable).map(PetResponse::from));
    }

    public PetResponse get(Long id) {
        return PetResponse.from(find(id));
    }

    @Transactional
    public PetResponse create(PetRequest request) {
        Pet pet = new Pet();
        apply(pet, request);
        return PetResponse.from(pets.save(pet));
    }

    @Transactional
    public PetResponse update(Long id, PetRequest request) {
        Pet pet = find(id);
        apply(pet, request);
        return PetResponse.from(pets.save(pet));
    }

    @Transactional
    public void delete(Long id) {
        pets.delete(find(id));
    }

    private Pet find(Long id) {
        return pets.findById(id).orElseThrow(() -> new NotFoundException("Pet not found"));
    }

    private void apply(Pet pet, PetRequest request) {
        pet.setName(request.getName().trim());
        pet.setCategory(request.getCategory().trim());
        pet.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
    }
}
