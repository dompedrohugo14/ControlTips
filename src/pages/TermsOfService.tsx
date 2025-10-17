import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Termos de Uso</h1>
          <p className="text-neutral-400 text-sm mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-6 text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Aceitação dos Termos</h2>
              <p className="text-sm leading-relaxed">
                Ao acessar e utilizar o Control Tips, você concorda com os presentes Termos de Uso.
                Caso não concorde, não utilize o sistema. Conforme Art. 5º, II da Constituição Federal,
                "ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Descrição do Serviço</h2>
              <p className="text-sm leading-relaxed">
                O Control Tips é uma ferramenta de gestão financeira para registro e análise de apostas esportivas.
                O sistema não realiza apostas, não processa pagamentos e não incentiva jogos de azar.
                Trata-se exclusivamente de uma ferramenta de controle pessoal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Responsabilidades do Usuário</h2>
              <p className="text-sm leading-relaxed mb-2">O usuário é responsável por:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Manter a confidencialidade de sua senha e credenciais de acesso</li>
                <li>Utilizar o sistema de forma lícita e respeitando a legislação brasileira</li>
                <li>Garantir a veracidade das informações fornecidas</li>
                <li>Respeitar os direitos de propriedade intelectual do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Limitação de Responsabilidade</h2>
              <p className="text-sm leading-relaxed">
                O Control Tips não se responsabiliza por perdas financeiras decorrentes de apostas realizadas pelo usuário.
                O sistema é uma ferramenta de gestão e não oferece garantias de lucro ou sucesso. Conforme Art. 927 do
                Código Civil, a responsabilidade por danos causados a terceiros é de quem os pratica.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Proteção de Dados</h2>
              <p className="text-sm leading-relaxed">
                O tratamento de dados pessoais segue a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                Coletamos apenas dados essenciais para o funcionamento do sistema. O usuário tem direito ao acesso,
                correção e exclusão de seus dados mediante solicitação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Propriedade Intelectual</h2>
              <p className="text-sm leading-relaxed">
                Todos os direitos sobre o sistema, incluindo design, código-fonte e marca, são protegidos pela
                Lei de Direitos Autorais (Lei 9.610/98). É proibida a reprodução, distribuição ou modificação
                sem autorização prévia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Alterações nos Termos</h2>
              <p className="text-sm leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado do sistema
                após alterações constitui aceitação dos novos termos. Recomendamos a revisão periódica deste documento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Cancelamento e Exclusão de Conta</h2>
              <p className="text-sm leading-relaxed">
                O usuário pode solicitar o cancelamento de sua conta a qualquer momento através do perfil do sistema.
                A exclusão resultará na remoção permanente de todos os dados associados à conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Legislação Aplicável</h2>
              <p className="text-sm leading-relaxed">
                Estes termos são regidos pela legislação brasileira. Eventuais disputas serão resolvidas no foro
                da comarca do domicílio do usuário, conforme Art. 101, I do Código de Defesa do Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Contato</h2>
              <p className="text-sm leading-relaxed">
                Para dúvidas, sugestões ou solicitações relacionadas a estes Termos de Uso, entre em contato através
                do email: controltipsall@gmail.com
              </p>
            </section>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mt-8">
          <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-neutral-400 text-sm mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-6 text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Coleta de Dados</h2>
              <p className="text-sm leading-relaxed mb-2">
                Em conformidade com o Art. 5º, X da Constituição Federal, que garante a inviolabilidade da intimidade
                e da vida privada, coletamos apenas os dados estritamente necessários:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Email e senha para autenticação</li>
                <li>Dados de apostas registradas (eventos, valores, resultados)</li>
                <li>Informações de perfil (nome, se fornecido voluntariamente)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Uso dos Dados</h2>
              <p className="text-sm leading-relaxed mb-2">Seus dados são utilizados exclusivamente para:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Autenticação e acesso ao sistema</li>
                <li>Armazenamento e exibição das suas apostas</li>
                <li>Geração de métricas e análises personalizadas</li>
                <li>Comunicações relacionadas ao serviço</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">
                Conforme LGPD (Lei 13.709/2018), não compartilhamos, vendemos ou transferimos seus dados a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Armazenamento e Segurança</h2>
              <p className="text-sm leading-relaxed">
                Os dados são armazenados em servidores seguros com criptografia. Implementamos medidas técnicas e
                administrativas para proteger suas informações contra acesso não autorizado, conforme Art. 46 da LGPD.
                Senhas são criptografadas e nunca armazenadas em texto puro.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Direitos do Titular</h2>
              <p className="text-sm leading-relaxed mb-2">
                Conforme Art. 18 da LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Solicitar portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Cookies e Rastreamento</h2>
              <p className="text-sm leading-relaxed">
                O sistema utiliza cookies essenciais para autenticação e funcionamento básico. Não utilizamos cookies
                de rastreamento ou publicidade. Você pode gerenciar cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Retenção de Dados</h2>
              <p className="text-sm leading-relaxed">
                Mantemos seus dados enquanto sua conta estiver ativa. Após solicitação de exclusão, todos os dados
                são permanentemente removidos em até 30 dias, salvo obrigações legais que exijam retenção por período
                maior.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Compartilhamento de Dados</h2>
              <p className="text-sm leading-relaxed">
                Não compartilhamos dados pessoais com terceiros, exceto quando estritamente necessário para operação
                do serviço (ex: infraestrutura de hospedagem), sempre sob rigorosos termos de confidencialidade e
                proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Menores de Idade</h2>
              <p className="text-sm leading-relaxed">
                O serviço não é destinado a menores de 18 anos. Conforme Art. 14 da LGPD, o tratamento de dados de
                crianças e adolescentes requer consentimento específico dos responsáveis legais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Alterações na Política</h2>
              <p className="text-sm leading-relaxed">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas através
                do email cadastrado. Recomendamos revisão regular deste documento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Contato - Encarregado de Dados</h2>
              <p className="text-sm leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais, entre em
                contato através do email: controltipsall@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
