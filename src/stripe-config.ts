export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_TEF3VU2muH1DlR',
    priceId: 'price_1SHmZMEtRKYSN4c1nsPg51FI',
    name: 'Control Tips - All Green',
    description: 'Acesso completo ao Control Tips com todas as funcionalidades premium para gestão profissional de apostas.',
    price: 19.99,
    currency: 'brl',
    currencySymbol: 'R$',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};