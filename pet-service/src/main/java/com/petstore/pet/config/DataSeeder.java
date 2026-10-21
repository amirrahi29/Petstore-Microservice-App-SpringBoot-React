package com.petstore.pet.config;

import com.petstore.pet.domain.Pet;
import com.petstore.pet.domain.PetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PetRepository pets;

    public DataSeeder(PetRepository pets) {
        this.pets = pets;
    }

    @Override
    public void run(String... args) {
        if (pets.count() > 0) {
            return;
        }
        pets.save(pet("Buddy", "Dog", "Friendly house dog"));
        pets.save(pet("Milo", "Cat", "Quiet indoor cat"));
        pets.save(pet("Goldie", "Fish", "Small goldfish"));
        pets.save(pet("Kiwi", "Bird", "Green parakeet"));
    }

    private Pet pet(String name, String category, String description) {
        Pet pet = new Pet();
        pet.setName(name);
        pet.setCategory(category);
        pet.setDescription(description);
        return pet;
    }
}
