import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ExternalLink, HelpCircle, AlertCircle, Phone, ThumbsUp, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function HelpPage() {
  // Função para abrir a página de doação quando o botão for clicado
  const handleDonateClick = () => {
    window.open('https://doe.institutoronald.org.br/app/single_step', '_blank');
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <Link href="/">
            <a className="mr-3">
              <ArrowLeft className="text-xl" />
            </a>
          </Link>
          <h1 className="font-montserrat font-bold text-xl">Ajuda</h1>
        </div>
      </header>

      <main className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Como podemos ajudar?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Encontre informações e suporte para utilizar melhor nossa plataforma de cursos
            ou contribuir com nossa causa.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <HelpCircle className="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Perguntas Frequentes</h3>
                <p className="text-sm text-gray-600">Encontre respostas para as dúvidas mais comuns sobre nossos cursos e plataforma.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Reportar Problema</h3>
                <p className="text-sm text-gray-600">Encontrou algum problema na plataforma? Informe para podermos melhorar.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <Phone className="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Contato</h3>
                <p className="text-sm text-gray-600">Entre em contato direto com nossa equipe para dúvidas ou sugestões.</p>
                <p className="text-sm font-medium mt-2">(21) 2543-0761</p>
                <p className="text-sm mt-1">contato@institutoronald.org.br</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <ThumbsUp className="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Enviar Feedback</h3>
                <p className="text-sm text-gray-600">Compartilhe sua experiência e ajude-nos a melhorar nossa plataforma.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center bg-orange-50 p-6 rounded-lg mb-8">
          <Heart className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">Apoie Nossa Causa</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sua doação ajuda a proporcionar melhores condições de tratamento para 
            crianças e adolescentes com câncer em todo o Brasil.
          </p>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-md"
            onClick={handleDonateClick}
          >
            <Heart className="h-5 w-5 mr-2" />
            FAÇA UMA DOAÇÃO
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Você será redirecionado para a página de doação do Instituto Ronald McDonald.
          </p>
        </div>
      </main>

      <BottomNavigation active="help" />
    </div>
  );
}