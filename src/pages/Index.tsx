
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
          Plataforma de Agendamentos para <span className="text-primary">Salões de Beleza</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Simplifique seus agendamentos, gerencie profissionais e serviços, e ofereça agendamento online para seus clientes.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="text-lg h-12">
            <Link to="/registrar">Comece Agora - 7 Dias Grátis</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg h-12">
            <Link to="/admin/login">Acesse sua Conta</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          title="Agendamento Online"
          description="Ofereça para seus clientes uma forma fácil de agendar serviços online, sem necessidade de telefone."
          icon="📅"
        />
        <FeatureCard
          title="Gerenciamento Completo"
          description="Cadastre profissionais, serviços e gerencie a agenda de cada profissional do seu salão."
          icon="👩‍💼"
        />
        <FeatureCard
          title="Notificações por WhatsApp"
          description="Envie lembretes automáticos por WhatsApp para reduzir faltas de clientes."
          icon="📱"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-playfair font-bold mb-6 text-center">
          Como Funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard
            number="1"
            title="Crie sua conta"
            description="Registre-se em poucos minutos e obtenha 7 dias de avaliação gratuita."
          />
          <StepCard
            number="2"
            title="Configure seu salão"
            description="Adicione seus profissionais e serviços na plataforma."
          />
          <StepCard
            number="3"
            title="Compartilhe seu link"
            description="Envie para seus clientes o link personalizado de agendamento."
          />
          <StepCard
            number="4"
            title="Gerencie agendamentos"
            description="Acompanhe e controle todos os agendamentos pelo painel administrativo."
          />
        </div>
      </div>

      <div className="text-center mb-20">
        <h2 className="text-3xl font-playfair font-bold mb-6">
          Pronto para simplificar sua gestão?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Junte-se a centenas de salões e profissionais que já estão usando nossa plataforma para facilitar o dia a dia.
        </p>
        <Button asChild size="lg" className="text-lg h-12">
          <Link to="/registrar">Criar Minha Conta</Link>
        </Button>
      </div>

      <div className="border-t pt-8">
        <h3 className="text-2xl font-playfair font-bold mb-4 text-center">
          Perguntas Frequentes
        </h3>
        <div className="max-w-3xl mx-auto">
          <FAQ
            question="Quanto custa usar a plataforma?"
            answer="Você pode experimentar gratuitamente por 7 dias. Após este período, temos planos a partir de R$49/mês para salões pequenos."
          />
          <FAQ
            question="Preciso instalar algo no meu computador?"
            answer="Não, a plataforma é totalmente online. Você pode acessar de qualquer dispositivo com internet."
          />
          <FAQ
            question="Como os clientes agendam serviços?"
            answer="Cada salão recebe um link personalizado que pode ser compartilhado com clientes via WhatsApp, redes sociais ou site."
          />
          <FAQ
            question="Posso cancelar minha assinatura a qualquer momento?"
            answer="Sim, você pode cancelar quando quiser. Não há contratos de fidelidade."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-4">
      {number}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FAQ = ({ question, answer }: { question: string; answer: string }) => (
  <div className="mb-6 border-b pb-6">
    <h4 className="text-lg font-bold mb-2">{question}</h4>
    <p className="text-gray-600">{answer}</p>
  </div>
);

export default Index;
