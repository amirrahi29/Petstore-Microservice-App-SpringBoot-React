package com.petstore.pet.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PetResponse {

    private Long id;
    private String name;
    private String category;
    private String description;

    public static PetResponse from(Pet pet) {
        return new PetResponse(pet.getId(), pet.getName(), pet.getCategory(), pet.getDescription());
    }
}
