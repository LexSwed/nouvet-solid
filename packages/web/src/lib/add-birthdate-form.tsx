import { useSubmission } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { createMemo, For, Show } from 'solid-js';
import {
  Button,
  Fieldset,
  Form,
  Icon,
  Option,
  Picker,
  Text,
  TextField,
} from '@nou/ui';

import { updatePetBirthDate } from '~/api/pet';
import { createTranslator, userLocale } from '~/server/i18n';

const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

interface AddBirthDateFormProps {
  id: string;
  pet: { id: number; name: string };
  onDismiss: () => void;
}

const AddBirthDateForm = (props: AddBirthDateFormProps) => {
  const t = createTranslator('app');
  const locale = userLocale();
  const birthDateSubmission = useSubmission(updatePetBirthDate);

  const monthNames = createMemo(() => {
    const formatter = Intl.DateTimeFormat(locale(), {
      month: 'long',
    });
    return Array.from({ length: 12 }).map((_, month) => {
      const date = new Date();
      date.setMonth(month, 1);
      return formatter.format(date);
    });
  });
  const dateOfBirthError = () =>
    birthDateSubmission.result?.errors &&
    'dateOfBirth' in birthDateSubmission.result.errors
      ? birthDateSubmission.result.errors.dateOfBirth
      : null;
  return (
    <Drawer id={props.id} placement="bottom-start">
      <Form
        class="flex w-[360px] max-w-full flex-col gap-6"
        action={updatePetBirthDate}
        method="post"
        validationErrors={birthDateSubmission.result?.errors}
      >
        <input type="hidden" name="petId" value={props.pet.id} />
        <Fieldset>
          <Text as="legend" with="label" class="mb-6 flex items-center gap-2">
            <span class="bg-on-surface/5 rounded-full p-3">
              <Icon use="calendar-plus" size="md" />
            </span>
            {t('app.animal-add-birth-date.label', { name: props.pet.name })}
          </Text>
          <div class="grid grid-cols-[4rem_1fr_5rem] gap-2">
            <TextField
              name="bday"
              label={t('app.animal-add-birth-date.day')}
              autocomplete="off"
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
            />
            <Picker
              label={t('app.animal-add-birth-date.month')}
              name="bmonth"
              autocomplete="off"
            >
              <Option value="" />
              <For each={monthNames()}>
                {(month, index) => <Option value={index()}>{month}</Option>}
              </For>
            </Picker>
            <TextField
              name="byear"
              label={t('app.animal-add-birth-date.year')}
              autocomplete="off"
              type="number"
              min="1980"
              max={new Date().getFullYear()}
              required
            />
          </div>
          <Show when={dateOfBirthError()}>
            {(text) => (
              <Text class="text-error" with="body-sm">
                {text()}
              </Text>
            )}
          </Show>
        </Fieldset>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:self-end">
          <Button
            variant="ghost"
            popoverTargetAction="hide"
            popoverTarget={props.id}
            class="px-6"
            onClick={props.onDismiss}
          >
            {t('app.animal.drawer.cancel')}
          </Button>
          <Button
            type="submit"
            class="px-6"
            loading={birthDateSubmission.pending}
            popoverTargetAction="hide"
            popoverTarget={props.id}
          >
            {t('app.animal.drawer.save')}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddBirthDateForm;