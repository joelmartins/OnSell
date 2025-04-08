import React from 'react';
import { Head } from '@inertiajs/react';
import LandingPageForm from './Form';

export default function LandingPageEdit({ landingPage, templates }) {
  return (
    <>
      <Head title={`Editar Landing Page - ${landingPage.name}`} />
      <LandingPageForm 
        landingPage={landingPage} 
        templates={templates} 
        isEditing={true} 
      />
    </>
  );
} 