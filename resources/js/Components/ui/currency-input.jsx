"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

// Usar forwardRef para compatibilidade com Controller
export const CurrencyInput = React.forwardRef(function CurrencyInput({
  id,
  name,
  value,
  onValueChange,
  placeholder = "R$ 0,00",
  decimalScale = 2,
  className,
  ...props
}, ref) {
  // Remover props customizadas que não devem ir para o DOM
  const domProps = { ...props };
  delete domProps.decimalSeparator;
  delete domProps.groupSeparator;

  const handleChange = (e) => {
    // Remove todos os caracteres não numéricos exceto vírgula
    let inputValue = e.target.value.replace(/[^\d,]/g, '');
    
    // Garante apenas uma vírgula
    const commaCount = (inputValue.match(/,/g) || []).length;
    if (commaCount > 1) {
      const parts = inputValue.split(',');
      inputValue = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Formata como moeda para exibição
    let formattedValue = '';
    if (inputValue) {
      // Separa a parte antes e depois da vírgula
      const parts = inputValue.split(',');
      let integerPart = parts[0] || '';
      const decimalPart = parts.length > 1 ? parts[1].substring(0, decimalScale) : '';
      
      // Adiciona pontos como separadores de milhar
      if (integerPart.length > 3) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      
      // Monta o valor formatado
      formattedValue = `R$ ${integerPart}${decimalPart ? ',' + decimalPart : ''}`;
    } else {
      formattedValue = '';
    }
    
    // Passa o valor formatado para o callback
    onValueChange(formattedValue);
  };

  return (
    <Input
      ref={ref}
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(className)}
      {...domProps}
    />
  );
}); 