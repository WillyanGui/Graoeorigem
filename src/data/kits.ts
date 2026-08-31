export interface Kit {
  id: number;
  productId?: string;
  name: string;
  description: string;
  descriptionLong: string;
  price: number;
  image: string;
  itemsIncluded: string[];
  objective: string;
  howToUse: string;
}

export const kitsData: Kit[] = [
  {
    id: 101,
    name: "Kit Origens Harmonizadas",
    description: "Uma imersão completa pelas montanhas brasileiras. Duas origens excepcionais acompanhadas de chocolate artesanal.",
    descriptionLong: "Desenvolvido por nossos sommeliers de café, o Kit Origens Harmonizadas traz o melhor dos dois mundos. Contém uma seleção minuciosa de nossos dois principais pilares: o Reserva Mogiana Clássico, encorpado e reconfortante para o dia a dia, e o Microlote Caparaó Floral, frutado e complexo para rituais especiais. Para complementar a sua jornada sensorial, o kit acompanha uma barra de chocolate chocolate meio amargo 70% cacau orgânico de origem controlada que harmoniza divinamente com as notas de ambos os cafés.",
    price: 98.90,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600",
    itemsIncluded: [
      "1x Embalagem de Reserva Mogiana Clássico (250g)",
      "1x Embalagem de Microlote Caparaó Floral (250g)",
      "1x Barra de Chocolate Intenso 70% de Origem Controlada (80g)",
      "1x Guia Prático de Harmonização Sensorial impresso"
    ],
    objective: "Proporcionar um contraste sensorial rico e educativo entre o terroir paulista e o terroir capixaba, impulsionando seu paladar com experiências harmônicas de cacau e acidez equilibrada.",
    howToUse: "Sugerimos preparar ambos os cafés de forma independente no filtro V60 ou coador tradicional. Tome um gole de café morno, espere alguns segundos, deguste um pequeno pedaço do chocolate e sinta-o derreter lentamente no céu da boca, em seguida finalize com mais um gole do café para revelar novas notas adocicadas de avelã e caramelo."
  },
  {
    id: 102,
    name: "Kit Ritual do Barista Iniciante",
    description: "Tudo o que você precisa para extrair o café coado perfeito na sua própria casa, com o frescor de moer os grãos na hora.",
    descriptionLong: "Transforme sua casa em uma cafeteria profissional de terceira onda. Este kit reúne as ferramentas essenciais para quem deseja se aprofundar na arte do café. Ele traz o clássico suporte cônico V60 em cerâmica japonesa para uma extração limpa e brilhante, nosso moedor manual de cerâmica ajustável para garantir que as notas voláteis não se dissipem, filtros de papel de porosidade equilibrada e, claro, um café especial colhido manualmente para coroar esse ritual.",
    price: 269.00,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600",
    itemsIncluded: [
      "1x Moedor Manual de Precisão com lâminas de cerâmica cônica",
      "1x Suporte de Filtro Coador V60 de Cerâmica Branca",
      "1x Pacote de Filtros de Papel Cônicos V60-02 (40 unidades)",
      "1x Pacote de Microlote Mantiqueira Frutado em Grãos (250g)"
    ],
    objective: "Dar asas ao barista apaixonado que existe em você, promovendo controle absoluto sobre a granulometria da moagem e o tempo de infusão.",
    howToUse: "Selecione uma moagem média-fina no moedor manual (daremos instruções no guia). Posicione o filtro V60 sobre sua caneca favorita, escalde o papel com água quente e descarte. Adicione 15g do café moído na hora. Faça a pré-infusão com 30ml de água a 94°C por 30 segundos, em seguida verta o restante da água (até atingir 225ml) em círculos calmos."
  },
  {
    id: 103,
    name: "Kit Duelo de Torras Clássicas",
    description: "Descubra como o perfil térmico de torra altera as nuances e aromas de um mesmo terroir nacional.",
    descriptionLong: "Você sabia que o tempo de forno e a temperatura de torra podem mudar completamente o sabor do grão? Este kit é uma verdadeira aula prática de ciência do café. Comparamos o mesmo café de alta linhagem submetido a dois testes de torra distintos: uma Torra Média (com foco em doçura caramelizada, castanhas e acidez cítrica suave) e uma Torra Escura Italiana (trazendo amargura encorpada, fumaça nobre, notas de tabaco doce e cacau puro). Acompanha duas canecas rústicas exclusivas de cerâmica com paredes grossas.",
    price: 139.90,
    image: "https://images.unsplash.com/photo-1580933187691-0f75c2aa60c3?q=80&w=600",
    itemsIncluded: [
      "1x Pacote de Café Origem Cerrado Mineiro - Torra Média (250g)",
      "1x Pacote de Café Origem Cerrado Mineiro - Torra Escura (250g)",
      "2x Canecas Rústicas Artesanais em Cerâmica de Argila Escura",
      "1x Ficha de Pontuação e Roda de Sabores da Associação de Cafés Especiais"
    ],
    objective: "Apresentar de maneira didática e palpável a influência térmica do mestre de torra no desenvolvimento dos óleos essenciais do grão.",
    howToUse: "Prepare as duas versões ao mesmo tempo usando a mesma moagem e temperatura de água. Sirva-as nas canecas rústicas. Deguste primeiro a versão de torra média para calibrar as notas mais leves de baunilha e frutas secas, e em seguida tome a versão de torra escura, prestando atenção em como o corpo cresce e a sensação licorosa se prolonga na língua."
  }
];
