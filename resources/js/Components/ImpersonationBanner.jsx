"use client";

import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ImpersonationBanner() {
    const [impersonationData, setImpersonationData] = useState(null);
    
    useEffect(() => {
        // Buscar dados da impersonação no armazenamento da sessão
        const data = sessionStorage.getItem('impersonate.data');
        if (data) {
            setImpersonationData(JSON.parse(data));
        }
    }, []);
    
    const stopImpersonating = () => {
        router.visit(route('stop.impersonating'), {
            onSuccess: () => {
                sessionStorage.removeItem('impersonate.data');
            }
        });
    };
    
    if (!impersonationData) {
        return null;
    }
    
    return (
        <div className="bg-amber-400 dark:bg-amber-700 w-full py-2 px-4 flex justify-between items-center">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-amber-700 dark:text-amber-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="text-amber-900 dark:text-amber-100 font-medium">
                    {impersonationData.type === 'agency' 
                        ? `Você está impersonando a agência: ${impersonationData.name}`
                        : `Você está impersonando o cliente: ${impersonationData.name}`}
                </span>
            </div>
            <button 
                onClick={stopImpersonating}
                className="px-3 py-1 bg-amber-500 dark:bg-amber-800 text-white rounded-md hover:bg-amber-600 dark:hover:bg-amber-900 transition-colors"
            >
                Sair da impersonação
            </button>
        </div>
    );
} 