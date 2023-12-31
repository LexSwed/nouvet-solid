import { splitProps, type JSX } from 'solid-js';
import spriteHref from '@nou/config/icons/sprite.svg';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from '../tw';

import { type SvgIcons } from './svg-icons';

export type { SvgIcons } from './svg-icons';

const iconVariants = cva('inline shrink-0', {
  variants: {
    size: {
      font: 'w-font h-font',
      xs: 'size-4',
      sm: 'size-6',
      md: 'size-8',
      lg: 'size-16',
      xl: 'size-24',
    },
  },
  defaultVariants: {
    size: 'font',
  },
});

export interface IconProps
  extends JSX.SvgSVGAttributes<SVGSVGElement>,
    VariantProps<typeof iconVariants> {
  use: SvgIcons;
}

const Icon = (ownProps: IconProps) => {
  const [local, props] = splitProps(ownProps, ['use', 'size']);
  return (
    <svg
      {...props}
      class={tw(iconVariants(local), props.class)}
      aria-hidden={!(props['aria-label'] || props['aria-labelledby'])}
    >
      <use href={`${spriteHref}#${local.use}`} />
    </svg>
  );
};

export { Icon };
