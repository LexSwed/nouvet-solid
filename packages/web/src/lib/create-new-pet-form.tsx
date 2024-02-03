import { useSubmission } from '@solidjs/router';
import { Show, type ParentProps } from 'solid-js';
import { Button, Card, Form, Text, TextField } from '@nou/ui';

import { createPetAction } from '~/api/pet';
import { AnimalTypeSelect } from '~/lib/animal-type';
import { GenderSwitch } from '~/lib/animal-type/animal-type';
import { createTranslator } from '~/server/i18n';

interface CreateNewPetForm extends ParentProps {
  minimal: boolean;
}

function CreateNewPetForm(props: CreateNewPetForm) {
  const t = createTranslator('pet-form');
  const petSubmission = useSubmission(createPetAction);

  const hasFailed = () =>
    petSubmission.result &&
    'failed' in petSubmission.result &&
    petSubmission.result.failed;

  return (
    <Card class="flex flex-col gap-6 p-4">
      <Form
        aria-labelledby="new-pet"
        class="flex flex-col gap-6"
        action={createPetAction}
        validationErrors={petSubmission.result?.errors || undefined}
        method="post"
        aria-errormessage="error-message"
      >
        <Text with="headline-2" as="h3" id="new-pet">
          {t('pet-form.new-pet-heading')}
        </Text>
        <TextField
          label={t('pet-form.new-pet-text-field-label')}
          placeholder={t('pet-form.new-pet-text-field-placeholder')}
          name="name"
          required
        />
        <AnimalTypeSelect name="type" />
        <GenderSwitch name="gender" />

        <Show when={hasFailed()}>
          <Card variant="filled" id="error-message" aria-live="polite">
            <Text with="body">{t('pet-form.new-pet-failure.title')}</Text>
            <Text with="body-sm" as="p">
              {t('pet-form.new-pet-failure.message')}
            </Text>
          </Card>
        </Show>

        <Button loading={petSubmission.pending} type="submit">
          Create
        </Button>
      </Form>
      {props.children}
    </Card>
  );
}

export default CreateNewPetForm;
