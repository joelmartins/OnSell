"use client";

import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function ImpersonationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [targets, setTargets] = useState({ agencies: [], clients: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Carregar alvos de impersonação quando o dropdown for aberto
        if (isOpen && (!targets.agencies.length && !targets.clients.length)) {
            loadTargets();
        }
    }, [isOpen]);

    const loadTargets = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('impersonate.targets'));
            setTargets(response.data);
        } catch (error) {
            console.error('Erro ao carregar alvos de impersonação:', error);
        } finally {
            setLoading(false);
        }
    };

    const impersonateAgency = (agency) => {
        // Salvar dados de impersonação no armazenamento da sessão
        sessionStorage.setItem('impersonate.data', JSON.stringify({
            id: agency.id,
            name: agency.name,
            type: 'agency'
        }));
        
        // Usar visit em vez de get para redirecionamentos
        router.visit(route('impersonate.agency', { agency: agency.id }));
        setIsOpen(false);
    };

    const impersonateClient = (client) => {
        // Salvar dados de impersonação no armazenamento da sessão
        sessionStorage.setItem('impersonate.data', JSON.stringify({
            id: client.id,
            name: client.name,
            type: 'client'
        }));
        
        // Usar visit em vez de get para redirecionamentos
        router.visit(route('impersonate.client', { client: client.id }));
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>Impersonar</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-1 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Carregando...</div>
                        ) : (
                            <>
                                {targets.agencies && targets.agencies.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Agências
                                        </div>
                                        {targets.agencies.map((agency) => (
                                            <button
                                                key={agency.id}
                                                onClick={() => impersonateAgency(agency)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                {agency.name}
                                            </button>
                                        ))}
                                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                    </>
                                )}

                                {targets.clients && targets.clients.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Clientes
                                        </div>
                                        {targets.clients.map((client) => (
                                            <button
                                                key={client.id}
                                                onClick={() => impersonateClient(client)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                {client.name}
                                            </button>
                                        ))}
                                    </>
                                )}

                                {!targets.agencies?.length && !targets.clients?.length && (
                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                        Nenhum alvo disponível para impersonação
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 