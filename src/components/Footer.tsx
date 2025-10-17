import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-7 h-7 text-yellow-500" strokeWidth={2.5} />
              <h3 className="text-xl font-bold text-yellow-500">Control Tips</h3>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Gerencie suas apostas de forma profissional e maximize seus resultados com análises detalhadas e métricas precisas.
            </p>
          </div>

          <div>
            <h4 className="text-neutral-200 font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-neutral-400 hover:text-yellow-500 transition-colors text-sm"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <a
                  href="#privacidade"
                  className="text-neutral-400 hover:text-yellow-500 transition-colors text-sm"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-200 font-semibold mb-4">Contato</h4>
            <p className="text-neutral-400 text-sm">
              Email: controltipsall@gmail.com
            </p>
            <p className="text-neutral-400 text-sm mt-3 italic">
              Nos dê sugestões, melhoramos por vocês!
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-neutral-500 text-sm">
            © 2025 Control Tips. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
