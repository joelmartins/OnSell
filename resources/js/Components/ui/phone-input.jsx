"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { ChevronDown } from 'lucide-react';

// Lista de países com códigos e bandeiras
const countries = [
  { code: '+55', name: 'Brasil', flag: '🇧🇷', format: '(99) 99999-9999' },
  { code: '+1', name: 'Estados Unidos', flag: '🇺🇸', format: '(999) 999-9999' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹', format: '999 999 999' },
  { code: '+34', name: 'Espanha', flag: '🇪🇸', format: '999 999 999' },
  { code: '+44', name: 'Reino Unido', flag: '🇬🇧', format: '7999 999999' },
  { code: '+49', name: 'Alemanha', flag: '🇩🇪', format: '999 9999999' },
  { code: '+33', name: 'França', flag: '🇫🇷', format: '9 99 99 99 99' },
  { code: '+39', name: 'Itália', flag: '🇮🇹', format: '999 999 9999' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷', format: '(99) 9999-9999' },
  { code: '+598', name: 'Uruguai', flag: '🇺🇾', format: '9 999 99 99' },
  { code: '+56', name: 'Chile', flag: '🇨🇱', format: '9 9999 9999' },
  { code: '+57', name: 'Colômbia', flag: '🇨🇴', format: '(999) 999-9999' },
  { code: '+52', name: 'México', flag: '🇲🇽', format: '(999) 999-9999' },
];

export function PhoneInput({
  id,
  name,
  value,
  country = '+55',
  onValueChange,
  onCountryChange,
  placeholder = "(00) 00000-0000",
  className,
  error,
  ...props
}) {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [phoneNumber, setPhoneNumber] = useState(value || '');
  const [inputPlaceholder, setInputPlaceholder] = useState(placeholder);
  
  useEffect(() => {
    // Buscar o país selecionado na lista
    const currentCountry = countries.find(c => c.code === selectedCountry);
    if (currentCountry) {
      setInputPlaceholder(currentCountry.format);
    }
  }, [selectedCountry]);
  
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    if (onCountryChange) {
      onCountryChange(countryCode);
    }
  };

  const handlePhoneChange = (e) => {
    // Remove todos os caracteres não numéricos
    let inputValue = e.target.value.replace(/\D/g, '');
    
    // Formatar o telefone de acordo com o país
    let formattedValue = '';
    if (inputValue) {
      if (selectedCountry === '+55') {
        // Brasil
        if (inputValue.length <= 10) {
          // Formato para telefones fixos: (99) 9999-9999
          formattedValue = inputValue.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3').trim();
        } else {
          // Formato para celulares: (99) 99999-9999
          formattedValue = inputValue.replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3').trim();
        }
      } else if (selectedCountry === '+1') {
        // EUA e Canadá
        formattedValue = inputValue.replace(/(\d{3})(\d{0,3})(\d{0,4})/, '($1) $2-$3').trim();
      } else {
        // Formato genérico para outros países
        formattedValue = inputValue.replace(/(\d{0,3})(\d{0,3})(\d{0,4})/, '$1 $2 $3').trim();
      }
    }
    
    setPhoneNumber(formattedValue);
    
    // Passa o valor formatado para o callback
    if (onValueChange) {
      onValueChange(formattedValue);
    }
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex gap-2">
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center">
                  <span className="mr-2">{country.flag}</span>
                  <span>{country.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          id={id}
          name={name}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={inputPlaceholder}
          className={cn(
            "flex-1",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
} 