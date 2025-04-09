import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Select from '@/Components/Select';
import { toast } from 'react-toastify';
import { RefreshCw, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function UserForm({ user = null, clients, agencies, isEditing, flash }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    role: user?.role || 'user',
    client_id: user?.client_id || '',
    agency_id: user?.agency_id || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  // Verificar a prop flash quando o componente é montado ou atualizado
  useEffect(() => {
    if (flash?.password_generated) {
      setNewPassword(flash.password_generated.password);
      setIsPasswordGenerated(true);
      toast.success(flash.password_generated.message || 'Nova senha gerada com sucesso!');
    }
  }, [flash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      put(route('admin.users.update', user.id), {
        onSuccess: () => reset(),
      });
    } else {
      post(route('admin.users.store'), {
        onSuccess: () => reset(),
      });
    }
  };

  const generatePassword = () => {
    if (window.confirm('Deseja realmente gerar uma nova senha para este usuário?')) {
      setIsGeneratingPassword(true);
      
      post(route('admin.users.generate-password', user.id), {
        preserveScroll: true,
        onSuccess: (page) => {
          if (page.props.flash?.password_generated) {
            const passwordData = page.props.flash.password_generated;
            setNewPassword(passwordData.password);
            setIsPasswordGenerated(true);
            toast.success(passwordData.message || 'Nova senha gerada com sucesso!');
          } else {
            toast.error('Não foi possível obter a senha gerada.');
          }
          setIsGeneratingPassword(false);
        },
        onError: () => {
          toast.error('Erro ao gerar nova senha');
          setIsGeneratingPassword(false);
        }
      });
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Senha copiada para a área de transferência!');
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? 'Editar Usuário' : 'Criar Usuário'}
            </h2>

            {isEditing && isPasswordGenerated && (
              <div className="mb-6 p-5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
                <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Nova senha gerada!
                </h3>
                <div className="flex items-center mb-3">
                  <div className="relative flex-grow">
                    <TextInput
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      className="w-full pr-24 text-base font-mono tracking-wide"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-20 top-1/2 transform -translate-y-1/2 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      <span className="ml-1 text-sm">{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  <strong>Atenção:</strong> Anote esta senha ou compartilhe-a com o usuário imediatamente. 
                  Por segurança, ela não será exibida novamente.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <InputLabel htmlFor="name" value="Nome" />
                <TextInput
                  id="name"
                  type="text"
                  name="name"
                  value={data.name}
                  className="mt-1 block w-full"
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
                <InputError message={errors.name} className="mt-2" />
              </div>

              <div>
                <InputLabel htmlFor="email" value="Email" />
                <TextInput
                  id="email"
                  type="email"
                  name="email"
                  value={data.email}
                  className="mt-1 block w-full"
                  onChange={(e) => setData('email', e.target.value)}
                  required
                />
                <InputError message={errors.email} className="mt-2" />
              </div>

              <div>
                <InputLabel htmlFor="role" value="Função" />
                <Select
                  id="role"
                  name="role"
                  value={data.role}
                  className="mt-1 block w-full"
                  onChange={(e) => setData('role', e.target.value)}
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="agency">Agência</option>
                  <option value="client">Cliente</option>
                  <option value="user">Usuário</option>
                </Select>
                <InputError message={errors.role} className="mt-2" />
              </div>

              {data.role === 'client' && (
                <div>
                  <InputLabel htmlFor="client_id" value="Cliente" />
                  <Select
                    id="client_id"
                    name="client_id"
                    value={data.client_id}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('client_id', e.target.value)}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                  <InputError message={errors.client_id} className="mt-2" />
                </div>
              )}

              {data.role === 'agency' && (
                <div>
                  <InputLabel htmlFor="agency_id" value="Agência" />
                  <Select
                    id="agency_id"
                    name="agency_id"
                    value={data.agency_id}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('agency_id', e.target.value)}
                    required
                  >
                    <option value="">Selecione uma agência</option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name}
                      </option>
                    ))}
                  </Select>
                  <InputError message={errors.agency_id} className="mt-2" />
                </div>
              )}

              {!isEditing && (
                <>
                  <div>
                    <InputLabel htmlFor="password" value="Senha" />
                    <div className="relative">
                      <TextInput
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('password', e.target.value)}
                        required={!isEditing}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Senha" />
                    <TextInput
                      id="password_confirmation"
                      type={showPassword ? 'text' : 'password'}
                      name="password_confirmation"
                      value={data.password_confirmation}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      required={!isEditing}
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                {isEditing && (
                  <SecondaryButton
                    type="button"
                    onClick={generatePassword}
                    disabled={isGeneratingPassword}
                    className="flex items-center"
                  >
                    {isGeneratingPassword ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {isGeneratingPassword ? 'Gerando...' : 'Gerar Nova Senha'}
                  </SecondaryButton>
                )}
                <div className="ml-auto">
                  <PrimaryButton disabled={processing}>
                    {isEditing ? 'Atualizar' : 'Criar'}
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 