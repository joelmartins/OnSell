"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export function PhoneInput({
  id,
  name,
  value,
  onValueChange,
  placeholder = "(00) 00000-0000",
  className,
  ...props
}) {
  const [countryCode, setCountryCode] = useState('+55'); // Brasil como padrão
  
  // Detecta o país com base no IP ao carregar o componente (simulado - sempre Brasil por padrão)
  useEffect(() => {
    // Em um caso real, aqui seria feita uma chamada a uma API de geolocalização
    // por IP para determinar o país e código do usuário
    setCountryCode('+55');
  }, []);

  const handleChange = (e) => {
    // Remove todos os caracteres não numéricos
    let inputValue = e.target.value.replace(/\D/g, '');
    
    // Formata o telefone brasileiro: (99) 99999-9999 ou (99) 9999-9999
    let formattedValue = '';
    if (inputValue) {
      if (inputValue.length <= 10) {
        // Formato para telefones fixos: (99) 9999-9999
        formattedValue = inputValue.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3').trim();
      } else {
        // Formato para celulares: (99) 99999-9999
        formattedValue = inputValue.replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3').trim();
      }
    }
    
    // Passa o valor formatado para o callback
    onValueChange(formattedValue);
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-2 text-gray-500 font-medium">
        {countryCode}
      </div>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("pl-12", className)}
        {...props}
      />
    </div>
  );
} 