import { Form, Icon, TextField } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";

import { updateFamily } from "~/server/api/family";
import { createTranslator } from "~/server/i18n";

export const FamilyNameForm = (props: {
	familyName: string | undefined | null;
}) => {
	const t = createTranslator("family");
	const updateFamilyAction = useAction(updateFamily);
	const updateFamilySubmission = useSubmission(updateFamily);
	return (
		<Form
			onFocusOut={async (e) => {
				const form = new FormData(e.currentTarget);
				const newName = form.get("family-name")?.toString().trim();
				if (newName !== props.familyName) {
					await updateFamilyAction(form);
				}
			}}
			autocomplete="off"
			validationErrors={updateFamilySubmission.result?.errors}
			aria-disabled={updateFamilySubmission.pending}
		>
			<TextField
				as="textarea"
				variant="ghost"
				placeholder={t("no-name")}
				label={t("update-name-label")}
				aria-description={t("update-name-description")}
				name="family-name"
				aria-disabled={updateFamilySubmission.pending}
				suffix={<Icon use="pencil" size="sm" />}
				class="w-full [&_textarea]:placeholder:text-on-surface"
				textSize="lg"
			>
				{props.familyName ?? ""}
			</TextField>
		</Form>
	);
};
