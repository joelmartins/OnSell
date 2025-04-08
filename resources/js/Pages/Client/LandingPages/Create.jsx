import React from 'react';
import { Head } from '@inertiajs/react';
import LandingPageForm from './Form';

export default function LandingPageCreate({ templates, remainingPages }) {
  return (
    <>
      <Head title="Criar Landing Page" />
      <LandingPageForm 
        templates={templates} 
        isEditing={false} 
      />
    </>
  );
} 