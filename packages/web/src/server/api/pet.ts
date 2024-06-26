import { action, cache } from "@solidjs/router";

import {
	createPetServer,
	getUserPetsServer,
	updatePetBirthDateServer,
	updatePetBreedServer,
	updatePetWeightServer,
} from "./pet.server";

export const getUserPets = cache(async () => getUserPetsServer(), "user-pets");

export const createPet = action(
	async (formData: FormData) => createPetServer(formData),
	"create-pet",
);

export const updatePetBirthDate = action(
	async (formData: FormData) => updatePetBirthDateServer(formData),
	"update-pet-birth-date",
);

export const updatePetWeight = action(
	async (formData: FormData) => updatePetWeightServer(formData),
	"update-pet-weight",
);

export const updatePetBreed = action(
	async (formData: FormData) => updatePetBreedServer(formData),
	"update-pet-breed",
);
