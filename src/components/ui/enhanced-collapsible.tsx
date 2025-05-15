
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { cn } from '@/lib/utils';

interface EnhancedCollapsibleProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  showBorder?: boolean;
}

export const EnhancedCollapsible: React.FC<EnhancedCollapsibleProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
  titleClassName,
  contentClassName,
  showBorder = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "w-full",
        showBorder && "border rounded-lg",
        className
      )}
    >
      <CollapsibleTrigger className={cn(
        "flex justify-between items-center w-full p-4",
        showBorder && "border-b",
        isOpen && showBorder && "border-b",
        !isOpen && showBorder && "border-b-0",
        titleClassName
      )}>
        <div>{title}</div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("p-4", contentClassName)}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EnhancedCollapsible;
