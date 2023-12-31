import { createEffect, createSignal, onCleanup, type JSX } from 'solid-js';
import {
  autoUpdate,
  computePosition,
  flip,
  inline,
  offset as offsetMiddleware,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type OffsetOptions,
  type ReferenceElement,
} from '@floating-ui/dom';

export { type Placement, type OffsetOptions } from '@floating-ui/dom';

export interface FloatingOptions {
  placement?: ComputePositionConfig['placement'];
  offset?: OffsetOptions;
}

interface FloatingState extends Omit<ComputePositionReturn, 'x' | 'y'> {
  x?: number | null;
  y?: number | null;
}

export interface FloatingResult extends FloatingState {
  style: JSX.CSSProperties | undefined;
  update(): void;
}

const strategy = 'absolute' as const;

export function createFloating<
  R extends ReferenceElement,
  F extends HTMLElement,
>(
  reference: () => R | undefined | null,
  floating: () => F | undefined | null,
  options?: FloatingOptions,
): FloatingResult {
  const placement = () => options?.placement ?? 'bottom';
  const offset = () => options?.offset ?? 8;

  const [data, setData] = createSignal<FloatingState>({
    x: null,
    y: null,
    placement: placement(),
    strategy,
    middlewareData: {},
  });

  async function update() {
    const currentReference = reference();
    const currentFloating = floating();

    if (currentReference && currentFloating) {
      try {
        const currentData = await computePosition(
          currentReference,
          currentFloating,
          {
            middleware: [
              inline(),
              flip({ padding: 8 }),
              offsetMiddleware(offset()),
            ],
            placement: placement(),
            strategy,
          },
        );
        if (
          currentFloating === floating() &&
          currentReference === reference()
        ) {
          setData(currentData);
        }
      } catch {
        /* empty */
      }
    }
  }

  createEffect(() => {
    const currentReference = reference();
    const currentFloating = floating();

    let clear: ReturnType<typeof autoUpdate> | undefined;
    if (currentReference && currentFloating) {
      clear = autoUpdate(currentReference, currentFloating, update);
      onCleanup(clear);
    } else {
      clear?.();
    }
  });

  return {
    get style() {
      if (typeof data().x !== 'number' || typeof data().y !== 'number') {
        return undefined;
      }
      return {
        inset: 'unset',
        top: `${data().y}px`,
        left: `${data().x}px`,
        position: strategy,
      };
    },
    get x() {
      return data().x;
    },
    get y() {
      return data().y;
    },
    get placement() {
      return data().placement;
    },
    get middlewareData() {
      return data().middlewareData;
    },
    strategy,
    update,
  };
}
