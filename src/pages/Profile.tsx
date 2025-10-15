import { useState, useEffect } from 'react';
import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle, ArrowLeft, Phone, Image, Shield, CreditCard, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, Profile as ProfileType } from '../lib/supabase';
import { stripeProducts } from '../stripe-config';
import { useTrialStatus } from '../hooks/useTrialStatus';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isTrialActive, daysRemaining, hoursRemaining, minutesRemaining, trialEndsAt, isSubscriptionActive, isAdmin } = useTrialStatus();

  useEffect(() => {
    fetchProfile();
    fetchSubscriptionStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!customer) return;

      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('customer_id', customer.customer_id)
        .maybeSingle();

      if (subscription) {
        setSubscriptionStatus(subscription.status);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Você precisa estar logado para assinar');
        setIsCheckingOut(false);
        return;
      }

      const product = stripeProducts[0];
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

      console.log('Iniciando checkout:', { product, apiUrl });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/dashboard`,
          cancel_url: `${window.location.origin}/profile`,
          mode: product.mode,
        }),
      });

      const data = await response.json();
      console.log('Resposta do checkout:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      if (data.url) {
        console.log('Redirecionando para:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (err) {
      console.error('Erro no checkout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Você precisa estar logado');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir conta');
      }

      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (newPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new Error('As novas senhas não coincidem');
        }
        if (newPassword.length < 6) {
          throw new Error('A nova senha deve ter no mínimo 6 caracteres');
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) throw updateError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setNewPassword('');
      setConfirmNewPassword('');
      await fetchProfile();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-neutral-400 hover:text-yellow-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500/10 to-neutral-900 p-8 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-yellow-500 mb-2">Meu Perfil</h1>
                <p className="text-neutral-400">Gerencie suas informações pessoais</p>
              </div>
              <div className="p-4 bg-neutral-900 rounded-full border border-yellow-500/30">
                <User className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-500 text-sm">{successMessage}</p>
              </div>
            )}

            {((isTrialActive && !isSubscriptionActive) || isAdmin) && (
              <div className="mb-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-2 border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-yellow-500" />
                    <div>
                      <h3 className="text-lg font-bold text-yellow-500">Período de Teste Gratuito</h3>
                      <p className="text-sm text-neutral-400">Aproveite todos os recursos gratuitamente</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-neutral-900/50 border border-yellow-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-500">{daysRemaining}</p>
                    <p className="text-xs text-neutral-400 mt-1">{daysRemaining === 1 ? 'Dia' : 'Dias'}</p>
                  </div>
                  <div className="bg-neutral-900/50 border border-yellow-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-500">{hoursRemaining}</p>
                    <p className="text-xs text-neutral-400 mt-1">{hoursRemaining === 1 ? 'Hora' : 'Horas'}</p>
                  </div>
                  <div className="bg-neutral-900/50 border border-yellow-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-500">{minutesRemaining}</p>
                    <p className="text-xs text-neutral-400 mt-1">{minutesRemaining === 1 ? 'Minuto' : 'Minutos'}</p>
                  </div>
                </div>
                {trialEndsAt && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-neutral-400">
                      Seu teste expira em: <span className="font-semibold text-yellow-500">{new Date(trialEndsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isSubscriptionActive && (
              <div className="mb-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/30 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-green-500 mb-2">Control Tips - All Green</h3>
                  <p className="text-3xl font-bold text-white mb-1">R$ 19,99<span className="text-lg text-neutral-400">/mês</span></p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start space-x-2 text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Tenha acesso total a plataforma</span>
                  </li>
                  <li className="flex items-start space-x-2 text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Gestão total da sua banca de apostas</span>
                  </li>
                  <li className="flex items-start space-x-2 text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Recursos exclusivos e detalhados</span>
                  </li>
                </ul>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Assinar Agora</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-neutral-200">Informações Pessoais</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Nome Completo</label>
                      <p className="text-neutral-200 text-lg">{profile?.full_name || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">E-mail</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-neutral-500" />
                        <p className="text-neutral-200 text-lg">{profile?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Telefone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        <p className="text-neutral-200 text-lg">{profile?.phone || 'Não informado'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Avatar URL</label>
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4 text-neutral-500" />
                        <p className="text-neutral-200 text-sm break-all">{profile?.avatar_url || 'Não informado'}</p>
                      </div>
                    </div>
                    {profile?.is_admin && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <p className="text-green-500 text-lg font-semibold">Administrador</p>
                        </div>
                      </div>
                    )}
                    {subscriptionStatus === 'active' && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Assinatura</label>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-green-500 text-lg font-semibold">Ativa</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lock className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-neutral-200">Segurança</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Senha</label>
                    <p className="text-neutral-200">••••••••</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/20"
                  >
                    Editar Perfil
                  </button>

                  <div className="pt-6 border-t border-neutral-800">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-3">
                      <h4 className="text-red-500 font-semibold mb-2">Zona de Perigo</h4>
                      <p className="text-sm text-neutral-400">
                        Ao excluir sua conta, todos os seus dados serão permanentemente removidos e sua assinatura será cancelada.
                      </p>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-3 px-6 bg-neutral-900 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg transition-colors border border-red-500/30 hover:border-red-500/50 flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Excluir Conta</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-neutral-300 text-center font-semibold">
                          Tem certeza? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-6 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Excluindo...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-5 h-5" />
                                <span>Confirmar Exclusão</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-neutral-200">Editar Informações</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-2">
                        Nome Completo
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Seu nome completo"
                        required
                        disabled={isSaving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        E-mail
                      </label>
                      <div className="flex items-center space-x-2 px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                        <Mail className="w-4 h-4 text-neutral-500" />
                        <p className="text-neutral-400">{profile?.email}</p>
                        <span className="text-xs text-neutral-500 ml-auto">(não editável)</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                          placeholder="(00) 00000-0000"
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="avatarUrl" className="block text-sm font-medium text-neutral-300 mb-2">
                        URL do Avatar
                      </label>
                      <div className="relative">
                        <Image className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <input
                          id="avatarUrl"
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                          placeholder="https://exemplo.com/foto.jpg"
                          disabled={isSaving}
                        />
                      </div>
                      {avatarUrl && (
                        <div className="mt-3">
                          <p className="text-xs text-neutral-400 mb-2">Preview:</p>
                          <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-neutral-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-neutral-200">Alterar Senha</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-neutral-400 mb-4">
                      Deixe em branco se não quiser alterar a senha
                    </p>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                        Nova Senha
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Mínimo 6 caracteres"
                        disabled={isSaving}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Digite a nova senha novamente"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile?.full_name || '');
                      setPhone(profile?.phone || '');
                      setAvatarUrl(profile?.avatar_url || '');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setError('');
                    }}
                    disabled={isSaving}
                    className="flex-1 py-3 px-6 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
