import { createMediaQuery } from '@solid-primitives/media';
import { Show, type ComponentProps } from 'solid-js';
import CorvuDrawer from 'corvu/drawer';

import { Button } from '../button';
import { Popover } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

import cssStyles from './drawer.module.css';

const Root = (props: ComponentProps<typeof CorvuDrawer.Root>) => {
  const isSmall = createMediaQuery('(max-width: 600px)');
  return (
    <Show
      when={isSmall()}
      children={<CorvuDrawer.Root {...props} />}
      fallback={<>{props.children}</>}
    />
  );
};

const Trigger = (props: ComponentProps<typeof Button>) => {
  const isSmall = createMediaQuery('(max-width: 600px)');
  return (
    <Show
      when={isSmall()}
      // @ts-expect-error Trigger props mismatch with custom Button
      children={<CorvuDrawer.Trigger {...props} as={Button} />}
      fallback={<Button {...props} />}
    />
  );
};

const DrawerContent = (ownProps: ComponentProps<'div'>) => {
  const context = CorvuDrawer.useDialogContext();
  return (
    <CorvuDrawer.Content
      {...(ownProps as ComponentProps<typeof CorvuDrawer.Content>)}
      popover="auto"
      onToggle={composeEventHandlers(ownProps.onToggle, (event) => {
        if (event.newState === 'open') {
          context.setOpen(true);
        } else {
          context.setOpen(false);
        }
      })}
      class={tw(cssStyles.drawer, ownProps.class)}
    />
  );
};

const Content = (ownProps: ComponentProps<'div'> & { id: string }) => {
  const isSmall = createMediaQuery('(max-width: 600px)');
  return (
    <Show
      when={isSmall()}
      children={<DrawerContent {...ownProps} />}
      fallback={
        <Popover
          {...ownProps}
          class={tw(cssStyles.popover, ownProps.class)}
          role="dialog"
        />
      }
    />
  );
};

const Drawer = {
  Root,
  Trigger,
  Content,
};

export { Drawer };
