import ClientLayout from '@/Layouts/ClientLayout';

export default function CampaignsIndex() {
  return (
    <ClientLayout title="Campanhas">
      <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-900 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Campanhas</h1>
        <p className="text-gray-700 dark:text-gray-200">Esta é uma página de exemplo para a listagem de campanhas do cliente.</p>
      </div>
    </ClientLayout>
  );
} 