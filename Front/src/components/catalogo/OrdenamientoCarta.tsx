import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon, type IconName } from '../Icon';
import { defaultSorting } from '../../constants/sorting';

interface PropiedadesOrdenamientoCarta<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options?: { id: T; name: string; icon: IconName; description: string }[];
  label?: string;
}

export function OrdenamientoCarta<T extends string>({
  value,
  onChange,
  options,
  label = 'Ordenar productos',
}: PropiedadesOrdenamientoCarta<T>) {
  const sortingList = options || (defaultSorting as unknown as { id: T; name: string; icon: IconName; description: string }[]);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, sortingList.findIndex(option => option.id === value));
  const [active, setActive] = useState(selected);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  function choose(index: number) {
    onChange(sortingList[index].id);
    setOpen(false);
  }

  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      setActive(
        event.key === 'Home'
          ? 0
          : event.key === 'End'
          ? sortingList.length - 1
          : !open
          ? selected
          : (active + (event.key === 'ArrowDown' ? 1 : -1) + sortingList.length) % sortingList.length
      );
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      choose(active);
    }
  }

  const currentOption = sortingList[selected] || sortingList[0];

  return (
    <div className="carta-sort-select" ref={root}>
      <span id={`${id}-label`}>Ordenar por:</span>
      <div className="carta-sort-control">
        <button
          type="button"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-haspopup="listbox"
          aria-activedescendant={open ? `${id}-${active}` : undefined}
          className="carta-sort-trigger"
          onKeyDown={keyboard}
          onClick={() => {
            setActive(selected);
            setOpen(!open);
          }}
        >
          <Icon name={currentOption.icon} />
          <span>{currentOption.name}</span>
          <Icon name="chevron" className="carta-sort-chevron" />
        </button>

        {open && (
          <ul
            id={`${id}-list`}
            className="carta-sort-options"
            role="listbox"
            aria-labelledby={`${id}-label`}
          >
            {sortingList.map((option, index) => (
              <li
                key={option.id}
                id={`${id}-${index}`}
                role="option"
                aria-selected={value === option.id}
                aria-label={option.name}
                data-active={active === index}
                onPointerMove={() => setActive(index)}
                onClick={() => choose(index)}
              >
                <Icon name={option.icon} />
                <span>
                  <strong>{option.name}</strong>
                  <small>{option.description}</small>
                </span>
                {value === option.id && <Icon name="check" className="carta-sort-check" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
