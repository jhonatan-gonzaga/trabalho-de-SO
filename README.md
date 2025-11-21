# 🎓 Projeto: Recomendador de Sistemas Operacionais

**Disciplina:** Sistemas Operacionais  
**Professor:** Ralisson  
**Semestre:** 2025/2 
👨‍💻 Autores (Equipe):
* **Jeziel Monteiro**
* **Jhonatan Gonzaga**
* **Caio Sobral**
* **Brainer**




# 🤖 Recomendador de Sistemas Operacionais (OS Recommender)

Este projeto é uma ferramenta interativa desenvolvida em front-end puro (HTML, CSS, JavaScript) que funciona como um **quiz técnico para recomendar um Sistema Operacional (SO)** ideal para o usuário.

A recomendação é baseada em uma matriz de pontuação ("impacto") que cruza as respostas do usuário com características técnicas detalhadas dos sistemas (Windows, Linux, macOS e Android). Ao final, a ferramenta gera um relatório técnico com justificativa e gráficos.

## ✨ Funcionalidades

- **Quiz Interativo:** Perguntas dinâmicas sobre preferências de segurança, kernel, usabilidade e ambiente.
- **Motor de Decisão:** Algoritmo que calcula a pontuação de cada SO com base em pesos definidos no JSON.
- **Relatório Técnico:** Exibe uma justificativa detalhada comparando Arquitetura, Segurança e Casos de Uso do SO vencedor versus os outros.
- **Visualização Gráfica:** Gráfico de barras comparativo (usando Chart.js).
- **Exportação PDF:** Geração de arquivo PDF com o resultado e a justificativa (usando jsPDF).

## 📂 Estrutura do Projeto

Abaixo está a organização dos arquivos. A pasta `data` contém a lógica dos dados ("backend" estático), enquanto a raiz contém a aplicação web.

```text
.
├── data/
│   ├── knowledgeBase.json   # Base de conhecimento (texto técnico sobre os SOs)
│   └── questions.json       # Perguntas, opções e pesos de impacto
│
├── index.html               # Interface do usuário (HTML5 + Bootstrap)
├── script.js                # Lógica do quiz, cálculo de pontuação e renderização
├── styles.css               # Estilização personalizada
└── LICENSE                  # Licença de uso (MIT)
```
## 🛠️ Tecnologias Utilizadas
HTML5 & CSS3

JavaScript (ES6 Modules)

Bootstrap 5 (Layout e componentes visuais)

Chart.js (Gráficos de resultado)

jsPDF (Exportação de relatórios)

## 🚀 Como Executar
Clone ou baixe este repositório.

Certifique-se de que a pasta data contém os arquivos JSON.

Abra o arquivo index.html em um navegador moderno.

Nota: Devido às políticas de segurança de CORS dos navegadores, se o fetch dos arquivos JSON falhar ao abrir localmente (protocolo file://), recomenda-se usar uma extensão como "Live Server" no VS Code ou rodar um servidor HTTP simples localmente (ex: python -m http.server).

📝 Detalhes dos Arquivos
script.js: Contém a função calculateScores() que itera sobre as respostas do usuário e soma os pontos definidos em questions.json. Também gerencia o DOM para alternar entre as telas de "Intro", "Quiz" e "Resultado".

knowledgeBase.json: Atua como um banco de dados estático. Se você quiser alterar a descrição técnica de um SO (ex: atualizar a arquitetura do Android), basta editar este arquivo sem mexer no código JavaScript.

📄 Licença
Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para mais informações.

