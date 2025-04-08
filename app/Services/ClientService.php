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
 * Check if a client can create more landing pages based on their plan.
 *
 * @param int $clientId
 * @return array
 */
public function canCreateLandingPage(int $clientId): array
{
    $client = Client::find($clientId);
    
    if (!$client) {
        return [
            'success' => false,
            'message' => 'Cliente não encontrado.'
        ];
    }
    
    $currentUsage = ClientUsage::getCurrentMonthUsage($clientId);
    
    if ($currentUsage->hasReachedLandingPagesLimit($clientId)) {
        return [
            'success' => false,
            'message' => 'Você atingiu o limite de landing pages para o seu plano atual.'
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Pode criar landing page.'
    ];
}

/**
 * Check if a client can add more leads based on their plan.
 *
 * @param int $clientId
 * @param int $leadsToAdd
 * @return array
 */
public function canAddLeads(int $clientId, int $leadsToAdd = 1): array
{
    $client = Client::find($clientId);
    
    if (!$client) {
        return [
            'success' => false,
            'message' => 'Cliente não encontrado.'
        ];
    }
    
    $currentUsage = ClientUsage::getCurrentMonthUsage($clientId);
    
    // Verifica o limite mensal
    $remainingMonthly = $currentUsage->getRemainingMonthlyLeads($clientId);
    
    if ($remainingMonthly < $leadsToAdd) {
        return [
            'success' => false,
            'message' => "Você só tem {$remainingMonthly} leads disponíveis no seu plano mensal atual.",
            'remaining' => $remainingMonthly
        ];
    }
    
    // Verifica o limite total
    $remainingTotal = $currentUsage->getRemainingTotalLeads($clientId);
    
    if ($remainingTotal < $leadsToAdd) {
        return [
            'success' => false,
            'message' => "Você só tem {$remainingTotal} leads disponíveis no seu limite total do plano.",
            'remaining' => $remainingTotal
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Pode adicionar leads.',
        'remaining_monthly' => $remainingMonthly,
        'remaining_total' => $remainingTotal
    ];
} 