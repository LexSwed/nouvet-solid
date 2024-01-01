import { For, createSignal } from 'solid-js';
import { type Meta } from 'storybook-solidjs';

import {
  coerce,
  maxValue,
  minValue,
  notValue,
  nullable,
  number,
  object,
  safeParse,
  string,
} from 'valibot';
import { Button } from '../button';
import { Card } from '../card';
import { Form } from '../form';
import { Option, Picker } from '../picker';
import { Text } from '../text';
import { TextField } from './';

const meta = {
  title: 'TextField',
  component: TextField,
  argTypes: {},
} satisfies Meta<typeof TextField>;

export default meta;

export const Primary = () => <TextField name="name" label="Pet name" />;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const WithErrors = () => {
  const [loading, setLoading] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string> | null>(null);

  async function server(data: unknown) {
    const PetSchema = object({
      name: string('Name cannot be empty', [
        notValue('admin', 'This name is already taken ;)'),
      ]),
      bday: nullable(
        coerce(
          number('Date format is incorrect', [minValue(1), maxValue(31)]),
          Number,
        ),
      ),
      bmonth: nullable(
        coerce(
          number('Date format is incorrect', [minValue(1), maxValue(12)]),
          Number,
        ),
      ),
      byear: nullable(
        coerce(
          number('Date format is incorrect', [
            minValue(1990),
            maxValue(new Date().getFullYear()),
          ]),
          Number,
        ),
      ),
    });
    await sleep(400);
    const result = safeParse(PetSchema, data);
    if (!result.success) {
      return {
        errors: Object.fromEntries(
          result.issues.map((issue) => [issue.path?.[0].key, issue.message]),
        ),
      };
    }
    return { pet: result.output };
  }

  const formatter = Intl.DateTimeFormat(document.documentElement.lang, {
    month: 'long',
  });
  const monthNames = Array.from({ length: 12 }).map((_, month) => {
    const date = new Date();
    date.setMonth(month, 1);
    return formatter.format(date);
  });

  return (
    <Card variant="flat" class="mx-auto w-[360px]">
      <Form
        class="flex flex-col gap-4"
        validationErrors={errors()}
        // eslint-disable-next-line solid/reactivity
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setLoading(true);
          const { errors } = await server({
            name: formData.get('name'),
            bday: formData.get('bday'),
            bmonth: formData.get('bmonth'),
            byear: formData.get('byear'),
          });
          if (errors) {
            setErrors(errors);
          } else {
            // Do not forget to reset the errors!
            setErrors(null);
          }
          setLoading(false);
        }}
      >
        <TextField
          name="name"
          label="Pet name"
          placeholder="Garfield"
          pattern="[a-zA-Z]*"
          autocomplete="off"
          required
          minLength={2}
        />
        <div class="flex flex-col gap-2">
          <Text component="label">Pet's birth date</Text>
          <div class="flex flex-row gap-2">
            <TextField
              name="bday"
              label="Day"
              autocomplete="off"
              type="number"
              min="1"
              max="31"
              class="flex-1"
            />
            <Picker
              label="Month"
              name="bmonth"
              autocomplete="off"
              class="flex-[2]"
            >
              <Option value="" />
              <For each={monthNames}>
                {(month, index) => <Option value={index()}>{month}</Option>}
              </For>
            </Picker>
            <TextField
              name="byear"
              label="Year"
              autocomplete="off"
              type="number"
              min="1990"
              max={new Date().getFullYear()}
              class="flex-1"
            />
          </div>
        </div>
        <Button type="submit" loading={loading()} class="ms-auto w-[7rem]">
          Submit
        </Button>
      </Form>
    </Card>
  );
};