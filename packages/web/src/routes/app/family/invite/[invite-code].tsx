import { Title } from '@solidjs/meta';
import {
  A,
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { Icon, Text } from '@nou/ui';

import { checkFamilyInvite } from '~/server/api/family-invite';
import { cacheTranslations, createTranslator } from '~/server/i18n';

export const route = {
  load(route) {
    const code = route.params['invite-code'];
    return Promise.all([cacheTranslations('invited'), checkFamilyInvite(code)]);
  },
} satisfies RouteDefinition;

const InviteAcceptPage = (props: RouteSectionProps) => {
  const code = props.params['invite-code'];
  const t = createTranslator('invited');
  const invite = createAsync(() => checkFamilyInvite(code), {
    deferStream: false,
  });
  return (
    <>
      <Title>{t('meta.title')}</Title>
      <div class="bg-main grid min-h-full grid-cols-[1fr] grid-rows-[auto,1fr] gap-4 p-4">
        <header class="container z-10 col-[1] row-[1] flex flex-col gap-4">
          <div class="flex flex-row items-center">
            <A href="/app" class="group -m-4 flex items-center gap-4 p-4">
              <Icon
                use="nouvet"
                class="size-14 duration-200 group-hover:-rotate-6"
              />
              <Text with="body-sm" class="hidden sm:inline-block">
                {t('logo-label')}
              </Text>
            </A>
          </div>
        </header>
        <main class="col-[1] row-[1/-1] grid grid-cols-12 grid-rows-subgrid items-center">
          <Switch>
            <Match when={!invite()}>
              <div class="bg-background bg-main z-10 col-span-3 col-start-2 row-[2] rounded-3xl p-4 [background-attachment:fixed]">
                <Text with="headline-1">Expired</Text>
              </div>

              <div class="col-span-7 col-end-[-1] row-[1/-1] rounded-3xl">
                <img
                  src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg?w=600&format=webp&imagetools"
                  alt=""
                  class="bg-primary/5 w-full rounded-xl object-cover"
                />
              </div>
            </Match>
          </Switch>
        </main>
      </div>
    </>
  );
};

export default InviteAcceptPage;