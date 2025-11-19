import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { COUNTRY_CODES, CountryCode, isCountrySupported } from '../../utils/countryCodes';
import { cn } from './utils';

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
  onUnsupportedSelect?: (country: CountryCode) => void;
  disabled?: boolean;
  className?: string;
}

export function CountryCodeSelect({ 
  value, 
  onChange, 
  onUnsupportedSelect,
  disabled = false,
  className 
}: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCountry = COUNTRY_CODES.find(country => country.code === value);

  const handleSelect = (country: CountryCode) => {
    if (country.supported) {
      onChange(country.code);
      setOpen(false);
    } else {
      onUnsupportedSelect?.(country);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select country code"
          className={cn(
            "w-[140px] justify-between h-11 px-3",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg leading-none">{selectedCountry?.flag}</span>
            <span className="font-mono text-sm truncate">{selectedCountry?.code}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." className="h-9" />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {COUNTRY_CODES.map((country) => (
              <CommandItem
                key={`${country.code}-${country.country}`}
                value={`${country.name} ${country.code}`}
                onSelect={() => handleSelect(country)}
                className={cn(
                  "flex items-center justify-between",
                  !country.supported && "opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{country.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{country.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!country.supported && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                  {country.code === value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}