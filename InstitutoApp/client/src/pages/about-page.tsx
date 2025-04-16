import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Phone, Mail, Globe, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-16">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <Link href="/">
            <a className="mr-3">
              <ArrowLeft className="text-xl" />
            </a>
          </Link>
          <h1 className="font-montserrat font-bold text-xl">Sobre Nós</h1>
        </div>
      </header>

      <main className="p-4">
        <div className="mb-8">
          <img 
            src="https://institutoronald.org.br/wp-content/uploads/2021/09/Logo-25anos-transparente-2000.png" 
            alt="Instituto Ronald McDonald" 
            className="w-48 mx-auto mb-4"
          />
          <p className="text-sm text-gray-600 mb-4">
            O Instituto Ronald McDonald é uma organização sem fins lucrativos que há mais de 20 anos 
            trabalha para promover a saúde e a qualidade de vida de crianças e adolescentes com câncer.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-primary">Nossa Missão</h2>
          <p className="text-sm text-gray-600 mb-4">
            Promover a saúde e a qualidade de vida de crianças e adolescentes com câncer e suas famílias.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-primary">Nossa Visão</h2>
          <p className="text-sm text-gray-600 mb-4">
            Contribuir para aumentar o índice de cura do câncer infantojuvenil no Brasil.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-primary">Nossos Valores</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-2">
            <li>Ética e transparência</li>
            <li>Compromisso com a causa</li>
            <li>Respeito à diversidade</li>
            <li>Trabalho em equipe</li>
            <li>Inovação e excelência</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-primary">Nossos Programas</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium text-primary">Diagnóstico Precoce</h3>
              <p className="text-sm text-gray-600">Capacitação de profissionais de saúde para detecção precoce do câncer infantojuvenil.</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium text-primary">Casas Ronald McDonald</h3>
              <p className="text-sm text-gray-600">Acomodação e suporte para famílias durante o tratamento.</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium text-primary">Espaços da Família</h3>
              <p className="text-sm text-gray-600">Ambiente acolhedor nas unidades hospitalares para pacientes e acompanhantes.</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-primary">Contato</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-gray-600">Rua Pedro Guedes, 29 - Maracanã, Rio de Janeiro - RJ, 20271-040</p>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-gray-600">(21) 2543-0761</p>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-gray-600">contato@institutoronald.org.br</p>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-gray-600">www.institutoronald.org.br</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="https://doe.institutoronald.org.br/app/single_step" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-md">
              <Heart className="h-5 w-5 mr-2" />
              FAÇA UMA DOAÇÃO
            </Button>
          </a>
        </div>
      </main>

      <BottomNavigation active="about" />
    </div>
  );
}