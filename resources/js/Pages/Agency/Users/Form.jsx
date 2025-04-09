import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { RefreshCw, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function UserForm({ user = null, clients, isEditing, flash }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    user_type: user ? (user.agency_id ? 'agency' : 'client') : 'client',
    client_id: user?.client_id || '',
    password: '',
    password_confirmation: '',
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
      put(route('agency.users.update', user.id), {
        onSuccess: () => reset(),
      });
    } else {
      post(route('agency.users.store'), {
        onSuccess: () => {
          reset();
          toast.success('Usuário criado com sucesso!');
        },
        onError: () => {
          toast.error('Erro ao criar usuário. Verifique os campos e tente novamente.');
        }
      });
    }
  };

  const generatePassword = () => {
    if (window.confirm('Deseja realmente gerar uma nova senha para este usuário?')) {
      setIsGeneratingPassword(true);
      
      post(route('agency.users.generate-password', user.id), {
        preserveScroll: true,
        onSuccess: () => {
          setIsGeneratingPassword(false);
          // A resposta é processada pelo Inertia automaticamente
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
    <>
      {isEditing && isPasswordGenerated && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
          <AlertCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-300">Nova senha gerada!</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  className="w-full pr-24 font-mono tracking-wide"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 px-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  <span className="ml-1 text-sm">{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                <strong>Atenção:</strong> Anote esta senha ou compartilhe-a com o usuário imediatamente. 
                Por segurança, ela não será exibida novamente.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            required
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_type">Tipo de Usuário</Label>
          <select
            id="user_type"
            value={data.user_type}
            onChange={(e) => setData('user_type', e.target.value)}
            disabled={isEditing}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          >
            <option value="agency">Usuário da Agência</option>
            <option value="client">Usuário de Cliente</option>
          </select>
          {errors.user_type && <p className="text-sm text-red-600">{errors.user_type}</p>}
        </div>

        {data.user_type === 'client' && (
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente</Label>
            <select
              id="client_id"
              value={data.client_id}
              onChange={(e) => setData('client_id', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required={data.user_type === 'client'}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.client_id && <p className="text-sm text-red-600">{errors.client_id}</p>}
          </div>
        )}

        {!isEditing && (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required={!isEditing}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar Senha</Label>
              <Input
                id="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                required={!isEditing}
              />
              {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-4">
          {isEditing && (
            <Button
              type="button"
              variant="outline"
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
            </Button>
          )}
          <div className={isEditing ? 'ml-auto' : 'w-full flex justify-end'}>
            <Button type="submit" disabled={processing}>
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
} 