import { Show } from 'solid-js';
import { type Meta } from 'storybook-solidjs';

import { Avatar } from '../avatar';
import { Button } from '../button';

import { Menu, MenuItem } from '.';

const meta = {
  title: 'Menu',
  component: Menu,
  argTypes: {},
} satisfies Meta<typeof Menu>;

export default meta;

export const SimpleMenu = () => {
  return (
    <>
      <Button popoverTarget="menu" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </Button>
      <Menu id="menu" placement="bottom-start">
        <MenuItem>Account</MenuItem>
        <MenuItem>Install for offline</MenuItem>
        <MenuItem>Log Out</MenuItem>
      </Menu>
    </>
  );
};

export const LazyRender = () => {
  const AsyncOrHeavyComponent = () => {
    return <div>This won't be rendered until the popover is open</div>;
  };
  return (
    <>
      <Button popoverTarget="menu">Open menu</Button>
      <Menu id="menu">
        {(open) => (
          <Show when={open()}>
            <AsyncOrHeavyComponent />
          </Show>
        )}
      </Menu>
    </>
  );
};

export const WithoutAutoClosingOnItemClick = () => {
  const nope = (event: MouseEvent) => event.preventDefault();
  return (
    <>
      <Button popoverTarget="menu" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </Button>
      <Menu id="menu" placement="bottom-end">
        <MenuItem onClick={nope}>Account</MenuItem>
        <MenuItem onClick={nope}>Install for offline</MenuItem>
        <MenuItem onClick={nope}>Log Out</MenuItem>
      </Menu>
    </>
  );
};
