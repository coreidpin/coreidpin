import React, { useState } from 'react';
import { MoreVertical, LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: LucideIcon;
  triggerLabel?: string;
  align?: 'start' | 'center' | 'end';
}

export function ActionMenu({
  items,
  triggerIcon: TriggerIcon = MoreVertical,
  triggerLabel,
  align = 'end',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = async (item: ActionMenuItem) => {
    if (!item.disabled) {
      await Promise.resolve(item.onClick());
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <TriggerIcon className="h-4 w-4" />
          {triggerLabel && <span className="sr-only">{triggerLabel}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((item, index) => {
          const ItemIcon = item.icon;
          const isDestructive = item.variant === 'destructive';

          return (
            <React.Fragment key={index}>
              {index > 0 && items[index - 1]?.variant === 'destructive' && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={isDestructive ? 'text-red-600 focus:text-red-600' : ''}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4 mr-2" />}
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
