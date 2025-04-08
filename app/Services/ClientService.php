/**
 * Verifica se o cliente possui acesso a determinado recurso com base no plano atual
 *
 * @param int $clientId ID do cliente
 * @param string $feature Nome do recurso a verificar
 * @return bool
 */
public function checkClientFeatureAccess(int $clientId, string $feature): bool
{
    $client = Client::find($clientId);
    
    if (!$client) {
        return false;
    }
    
    $plan = $client->plan;
    
    if (!$plan) {
        return false;
    }
    
    switch ($feature) {
        case 'whatsapp_integration':
            return (bool) $plan->has_whatsapp_integration;
        case 'email_integration':
            return (bool) $plan->has_email_integration;
        case 'meta_integration':
            return (bool) $plan->has_meta_integration;
        case 'google_integration':
            return (bool) $plan->has_google_integration;
        case 'custom_domain':
            return (bool) $plan->has_custom_domain;
        default:
            return false;
    }
}

/**
 * Check if a client can create more pipelines based on their plan.
 *
 * @param int $clientId
 * @return array
 */
public function canCreatePipeline(int $clientId): array
{
    $client = Client::find($clientId);
    
    if (!$client) {
        return [
            'success' => false,
            'message' => 'Cliente não encontrado.'
        ];
    }
    
    $currentUsage = ClientUsage::getCurrentMonthUsage($clientId);
    
    if ($currentUsage->hasReachedPipelinesLimit($clientId)) {
        return [
            'success' => false,
            'message' => 'Você atingiu o limite de pipelines para o seu plano atual.'
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Pode criar pipeline.'
    ];
}

/**
 * Check if a client can create more automation flows based on their plan.
 *
 * @param int $clientId
 * @return array
 */
public function canCreateAutomationFlow(int $clientId): array
{
    $client = Client::find($clientId);
    
    if (!$client) {
        return [
            'success' => false,
            'message' => 'Cliente não encontrado.'
        ];
    }
    
    $currentUsage = ClientUsage::getCurrentMonthUsage($clientId);
    
    if ($currentUsage->hasReachedAutomationFlowsLimit($clientId)) {
        return [
            'success' => false,
            'message' => 'Você atingiu o limite de fluxos de automação para o seu plano atual.'
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Pode criar fluxo de automação.'
    ];
}

/**
 * Check if a client can add more contacts based on their plan.
 *
 * @param int $clientId
 * @param int $contactsToAdd
 * @return array
 */
public function canAddContacts(int $clientId, int $contactsToAdd = 1): array
{
    $client = Client::find($clientId);
    
    if (!$client) {
        return [
            'success' => false,
            'message' => 'Cliente não encontrado.'
        ];
    }
    
    $currentUsage = ClientUsage::getCurrentMonthUsage($clientId);
    
    $remaining = $currentUsage->getRemainingContacts($clientId);
    
    if ($remaining < $contactsToAdd) {
        return [
            'success' => false,
            'message' => "Você só tem {$remaining} contatos disponíveis no seu plano atual.",
            'remaining' => $remaining
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Pode adicionar contatos.',
        'remaining' => $remaining
    ];
} 