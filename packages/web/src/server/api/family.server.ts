"use server";

import { json, redirect } from "@solidjs/router";
import * as v from "valibot";

import { getUserFamily } from "~/server/api/user";
import { getRequestUser } from "~/server/auth/request-user";
import { familyCancelJoin } from "~/server/db/queries/familyCancelJoin";
import { familyDelete } from "~/server/db/queries/familyDelete";
import { familyMember, familyMembers } from "~/server/db/queries/familyMembers";
import { familyUpdate } from "~/server/db/queries/familyUpdate";
import { type ErrorKeys, translateErrorTokens } from "~/server/utils";

import { familyLeave } from "../db/queries/familyLeave";
import { IncorrectFamilyMemberId } from "../errors";

export async function getFamilyMembersServer() {
	try {
		const user = await getRequestUser();
		const members = await familyMembers(user.userId);

		return members;
	} catch (error) {
		console.error(error);
		// TODO: Error handling
		throw error;
	}
}

export async function getFamilyMemberServer(memberId: unknown) {
	try {
		const user = await getRequestUser();
		if (typeof memberId !== "string") throw new Error("Invalid request");

		const member = await familyMember(user.userId, memberId);

		if (!member) throw new IncorrectFamilyMemberId();

		return member;
	} catch (error) {
		console.error(error);
		// TODO: Error handling
		throw error;
	}
}

const FamilyUpdateSchema = v.object({
	name: v.config(v.pipe(v.string(), v.trim(), v.nonEmpty()), {
		message: "family.name" satisfies ErrorKeys,
	}),
});
export async function updateFamilyServer(formData: FormData) {
	try {
		const user = await getRequestUser();
		const { name } = v.parse(FamilyUpdateSchema, {
			name: formData.get("family-name"),
		});
		const family = await familyUpdate({ familyOwnerId: user.userId, name });

		return json(
			{
				family,
				errors: null,
			},
			{
				revalidate: [getUserFamily.key],
			},
		);
	} catch (error) {
		if (v.isValiError(error)) {
			return json(
				{ failed: true, errors: await translateErrorTokens(error) },
				{ status: 500, revalidate: [] },
			);
		}
		console.error(error);
		return json({ failed: true, errors: null }, { status: 500, revalidate: [] });
	}
}

export async function deleteFamilyServer() {
	try {
		const user = await getRequestUser();
		const family = await familyDelete(user.userId);
		return json(
			{
				family,
				errors: null,
			},
			{
				headers: new Headers([["Location", "302"]]),
				revalidate: [getUserFamily.key],
			},
		);
	} catch (error) {
		console.error(error);
		return json({ failed: true, errors: null }, { status: 500, revalidate: [] });
	}
}

export async function cancelFamilyJoinServer() {
	try {
		const user = await getRequestUser();
		await familyCancelJoin(user.userId);
		return redirect("/app", { revalidate: [getUserFamily.key] });
	} catch (error) {
		console.error(error);
		return json({ error: "Something went wrong" }, { status: 500, revalidate: [] });
	}
}

export async function leaveFamilyServer() {
	try {
		const user = await getRequestUser();
		await familyLeave(user.userId);
		return redirect("/app", { revalidate: [getUserFamily.key] });
	} catch (error) {
		console.error(error);
		return json({ error: "Something went wrong" }, { status: 500, revalidate: [] });
	}
}
