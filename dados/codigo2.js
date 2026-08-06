//MISSION PATROL CODIGO v3000 - save completo!












// Mantenha a página ativa com keep-alive
setInterval(() => {
    fetch('/keep-alive');  // Mande uma requisição ao servidor para manter a conexão viva
}, 60000);  // 60 segundos





document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('Página voltou a ficar visível, verificando estado...');
        carregarImagens();  // Recarregar imagens
        // Você pode também recarregar o estado da página, como as cartas na mesa
        atualizarEstadoJogo();  // Função para garantir que o estado do jogo seja atualizado
    }
});

function atualizarEstadoJogo() {
    // Função que garante que o estado da mesa, cartas, ou outros elementos críticos estejam consistentes
    console.log('Estado do jogo atualizado');
}














function reloadCardImage() {
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

    const cardSrc = selectedCard.getAttribute('data-original-src');
    selectedCard.src = '';  // Limpa o `src` temporariamente
    setTimeout(() => {
        const timestamp = new Date().getTime();  // Cache busting para evitar problemas de cache
        selectedCard.src = `${cardSrc}?t=${timestamp}`;
        alert("Imagem da carta recarregada!");
    }, 100);  // Pequeno delay para forçar o navegador a recarregar
}





//faz o tratametno de erro caso a imagem do deck não carregue! IMAGENS BARRA DA ESQUERDA
function reloadDeckImage(imgElement, src) {
    const timestamp = new Date().getTime();  // Gera um timestamp único
    imgElement.src = `${src}?t=${timestamp}`;  // Força o recarregamento da imagem com cache busting
}










//________________________________________________________



//_________________________________________________






// Função para gerar automaticamente os nomes das imagens dos decks
function generateDeckImages(deckNumber, numCards) {
    const deck = [];
    for (let i = 1; i <= numCards; i++) {
        deck.push(`deck${deckNumber}/card${i}.jpeg`);
//deck.push(`https://www.aikidojundiai.wuaze.com/jogos/malleus_1666/deck${deckNumber}/card${i}.jpeg`);

    }
    return shuffleDeck(deck); // Embaralha o deck após gerar
}

// Função para embaralhar o deck usando o algoritmo de Fisher-Yates
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Troca as posições das cartas
    }
    return deck;
}

// Função para gerar todos os decks dinamicamente com base no número de decks e cartas por deck
function generateAllDecks(numDecks, numCardsPerDeck) {
    const allDecks = {};
    for (let i = 1; i <= numDecks; i++) {
        allDecks[i] = generateDeckImages(i, numCardsPerDeck[i - 1]);
    }
    return allDecks;
}

const numDecks = 28;
const numCardsPerDeck = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const allDecks = generateAllDecks(numDecks, numCardsPerDeck);

// Variáveis globais para o controle
let topZIndex = 1;
let currentElement = null;
let selectedCard = null;
let zoomLevel = 1;
let isDragging = false;
let isDraggingTable = false;
let offsetX = 0, offsetY = 0;
let tableStartX = 0, tableStartY = 0;
let scrollLeft = 0, scrollTop = 0;
let autoScrollInterval = null; // Para controlar o auto-scroll
let isCardLocked = false; // Estado de travamento
let novoConjunto = 0; // Para usar na colocação de novos conjuntos de dados

// Função para sortear uma carta de um dos decks
function drawCard(deckNumber) {
    let deck = allDecks[deckNumber];
    if (deck.length === 0) {
        alert(`Não há mais cartas no Deck ${deckNumber}!`);
        return;
    }
    const cardSrc = deck.pop();  // Pega uma carta do topo do deck
    placeCardOnTable(deckNumber, cardSrc);  // Coloca a carta na mesa
}





// --------------------------------------------------------------------------------------------------------//






// Função para virar a carta (alternar entre frente e costas)
function flipCard() {
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

    
      //trava funcao se cartatravada
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Imped se a carta estiver travada
    }
    
    
    const isFlipped = selectedCard.getAttribute('data-flipped') === 'true';  // Verifica se está virada

    closeCardOptions();  // Fecha o popup de opções
    
    if (isFlipped) {
        // Se estiver virada, mostra a frente da carta novamente
        const originalCardSrc = selectedCard.getAttribute('data-original-src');  // Obtém a imagem original da frente
        selectedCard.setAttribute('src', originalCardSrc);  // Define a frente da carta
        selectedCard.setAttribute('data-flipped', 'false');  // Marca como não virada
    } else {
        // Se estiver com a frente visível, vira para as costas específicas
        const originalCardSrc = selectedCard.getAttribute('data-original-src');  // Obtém o caminho da frente
        const backSrc = originalCardSrc.replace('.jpeg', 'back.jpeg');  // Substitui 'card1.jpeg' por 'card1back.jpeg'
        selectedCard.setAttribute('data-original-src', originalCardSrc);  // Armazena a frente
        selectedCard.setAttribute('src', backSrc);  // Mostra a imagem das costas específicas
        selectedCard.setAttribute('data-flipped', 'true');  // Marca como virada
    }
}
















// --------------------------------------------------------------------------------------------------------//


//funçao que coloca as cartas na mesa... pode escolheer quais decks entram de frente ou costas!
  function placeCardOnTable(deckNumber, cardSrc) {
    const tableArea = document.getElementById('table-area');

    // Container para a carta e o botão de virar
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card-container');
    cardContainer.style.position = 'relative';  // Importante para posicionar o botão relativo à carta

    const cardImage = document.createElement('img');
    const backSrc = cardSrc.replace('.jpeg', 'back.jpeg');  // Substitui 'card1.jpeg' por 'card1back.jpeg'




// Adiciona o lazy loading para tentar resolver o problema do bug das imagens com a aba aberta muito tempo
    cardImage.loading = 'lazy';  // <---- Aqui você adiciona o lazy loading





    // Verifica se o deck deve entrar de frente ou de costas
    const decksFaceUp = [1, 2, 3];  // Decks que devem entrar com a frente visível
    if (decksFaceUp.includes(deckNumber)) {
        // Exibir a frente da carta
        cardImage.src = cardSrc;  // Exibe a frente
        cardImage.setAttribute('data-flipped', 'false');  // Marca como não virada (frente para cima)
    } else {
        // Exibir as costas da carta
        cardImage.src = backSrc;  // Exibe as costas
        cardImage.setAttribute('data-flipped', 'true');  // Marca como virada (costas para cima)
    }

    cardImage.setAttribute('data-original-src', cardSrc);  // Armazena a frente da carta
    cardImage.classList.add('card');  // Classe padrão para todas as cartas
    cardImage.setAttribute('data-deck', deckNumber);




function placeCardOnTable(deckNumber, cardSrc) {
    const tableArea = document.getElementById('table-area');

    // Container para a carta e o botão de virar
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card-container');
    cardContainer.style.position = 'relative';

    const cardImage = document.createElement('img');
    const backSrc = cardSrc.replace('.jpeg', 'back.jpeg');

    // Configurar o src da imagem e o atributo data
    const decksFaceUp = [1, 2, 3];  // Decks que devem entrar com a frente visível
    if (decksFaceUp.includes(deckNumber)) {
        cardImage.src = cardSrc;
        cardImage.setAttribute('data-flipped', 'false');
    } else {
        cardImage.src = backSrc;
        cardImage.setAttribute('data-flipped', 'true');
    }

    cardImage.setAttribute('data-original-src', cardSrc);
    cardImage.classList.add('card');
    cardImage.setAttribute('data-deck', deckNumber);

    

// Adicionar o tratamento de erro para recarregar a imagem
    cardImage.onerror = function() {
        const src = cardImage.src.split('?')[0];  // Remove qualquer cache busting anterior
        const timestamp = new Date().getTime();  // Gera um novo timestamp
        cardImage.src = `${src}?t=${timestamp}`;  // Recarrega a imagem
    };

    cardContainer.appendChild(cardImage);
    tableArea.appendChild(cardContainer);
}





// Adicionar classes específicas para deck1 e deck2 que são os marcadores nesta mesa
    if (deckNumber === 1) {
        cardImage.classList.add('deck4circular-card');  // Estilo personalizado para cartas do Deck 1
    } else if (deckNumber === 2) {
        cardImage.classList.add('deck1menor-card');  // Estilo personalizado para cartas do Deck 2
    } else if (deckNumber === 3) {
        cardImage.classList.add('deck1menor-card');  // Estilo personalizado para cartas do Deck 3
    } else if (deckNumber === 4) {
        cardImage.classList.add('deck1menor-card');  // Estilo personalizado para cartas do Deck 4
    } else if (deckNumber === 5) {
        cardImage.classList.add('deck1menor-card');  // Estilo personalizado para cartas do Deck 5
    } else if (deckNumber === 6) {
        cardImage.classList.add('deck4-card');  // Estilo personalizado para miniaturas
    } else if (deckNumber === 10) {
        cardImage.classList.add('deck8-card');  // Estilo personalizado para cartas do Deck 10
    } else if (deckNumber === 11) {
        cardImage.classList.add('deck8-card');  // Estilo personalizado para cartas do Deck 11
    } else if (deckNumber === 13) {
        cardImage.classList.add('deck8-card');  // Estilo personalizado para cartas do Deck 13
    } else if (deckNumber === 9) {
        cardImage.classList.add('deck8-card');  // Estilo personalizado para cartas do Deck 9
    } else if (deckNumber === 14) {
        cardImage.classList.add('deck8-card');  // Estilo personalizado para cartas do Deck 14
    }
    

    // Botão para virar a carta
    const flipButton = document.createElement('button');
    flipButton.innerHTML = '';  // Ícone ou texto para o botão de virar
    flipButton.classList.add('flip-button');
    flipButton.style.position = 'absolute';
    flipButton.style.top = '5px';
    flipButton.style.right = '5px';

    // Evento do botão para virar a carta
    flipButton.addEventListener('click', () => {
        flipCard(cardImage, deckNumber, cardSrc);  // Chama a função para virar a carta
    });

    // Adicionar a carta e o botão no container
    cardContainer.appendChild(cardImage);
    cardContainer.appendChild(flipButton);

    // Adicionar o container com a carta na mesa
    tableArea.appendChild(cardContainer);

    // --- Eventos para clique longo ou toque longo ---
    cardImage.addEventListener('mousedown', () => {
        handleLongPress(cardImage);  // Inicia o temporizador do clique longo
    });
    
    cardImage.addEventListener('touchstart', () => {
        handleLongPress(cardImage);  // Inicia o temporizador do toque longo
    });

    // Cancela o clique/toque longo quando o usuário solta (mouseup/touchend)
    cardImage.addEventListener('mouseup', clearLongPressTimeout);
    cardImage.addEventListener('mouseleave', clearLongPressTimeout);
    cardImage.addEventListener('touchend', clearLongPressTimeout);
    cardImage.addEventListener('touchcancel', clearLongPressTimeout);

    // Cancela o toque longo se houver movimento
    cardImage.addEventListener('mousemove', clearLongPressTimeout);
    cardImage.addEventListener('touchmove', clearLongPressTimeout);

    // Posicionar a carta de acordo com o deck
    if (deckNumber === 1) {
        cardImage.style.left = '10px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 2) {
        cardImage.style.left = '210px';
        cardImage.style.top = '80px';
    } else if (deckNumber === 3) {
        cardImage.style.left = '30px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 4) {
        cardImage.style.left = '40px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 5) {
        cardImage.style.left = '50px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 6) {
        cardImage.style.left = '60px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 7) {
        cardImage.style.left = '70px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 8) {
        cardImage.style.left = '80px';
        cardImage.style.top = '10px';
    } else if (deckNumber === 9) {
        cardImage.style.left = '90px';
        cardImage.style.top = '10px';
    } else {
        // Posição padrão se o deck não estiver mapeado
        cardImage.style.left = '100px';
        cardImage.style.top = '10px';
    }

    cardImage.style.zIndex = topZIndex++;  // Aumentar o z-index para trazer a carta à frente
    cardImage.draggable = false;
    cardImage.setAttribute('data-at-top', 'false');

    // Eventos de clique e toque para selecionar a carta e abrir o pop-up
    cardImage.addEventListener('click', (e) => selectCardOnTable(cardImage));
    cardImage.addEventListener('dblclick', () => openCardOptions(cardImage));

    // Detectar toque duplo em dispositivos móveis
    cardImage.addEventListener('touchstart', handleTouch);

    // Eventos para arrastar a carta
    cardImage.addEventListener('mousedown', onMouseDown);
    cardImage.addEventListener('touchstart', onTouchStart);

    tableArea.appendChild(cardImage);

    // Garantir que as cartas "sempre visível" fiquem no topo, se existirem
    ensureFixedCardsOnTop();
}








function verificaCartasnaMesa() {
    const tableArea = document.getElementById('table-area');

    // Verificar as cartas já presentes na mesa
    const existingCards = tableArea.getElementsByClassName('card'); // Obtém todas as cartas na mesa
    if (existingCards.length > 0) {
        // Criar uma lista com os decks das cartas já presentes
        const cardDetails = Array.from(existingCards).map(card => {
            const deckNumber = card.getAttribute('data-deck') || 'N/A';
            const cardSrc = card.getAttribute('data-original-src') || 'N/A';
            return { deckNumber, cardSrc }; // Armazena como objeto para fácil acesso
        });

        // Mostrar um alerta com as cartas já presentes
        const cardDetailsString = cardDetails.map(details => `Deck: ${details.deckNumber}, Src: ${details.cardSrc}`).join('\n');
        alert(`Cartas já na mesa:\n${cardDetailsString}`);

        // Remover as cartas de allDecks
        cardDetails.forEach(({ deckNumber, cardSrc }) => {
            allDecks[deckNumber] = allDecks[deckNumber].filter(card => card !== cardSrc);
        });
    } else {
       // alert("Não há cartas na mesa.");
    }
}

// Chamar a função após o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    // Chama a função após um pequeno atraso
    setTimeout(verificaCartasnaMesa, 2000); // Atraso de 1000ms (1 segundo)
});






// --------------------------------------------------------------------------------------------------------//






// Função para lidar com toque duplo (dois toques)
let lastTouch = 0;
function handleTouch(event) {
    const currentTime = new Date().getTime();
    const timeSinceLastTouch = currentTime - lastTouch;

    if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
        openCardOptions(event.target);
    }

    lastTouch = currentTime;
}

// Função para selecionar uma carta (adicionar borda vermelha e trazer para frente)
function selectCardOnTable(card) {
    if (isDragging) return;

    // Remover borda da carta anterior
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }

    // Adicionar borda vermelha à carta atual
    selectedCard = card;
    card.classList.add('selected');

    // Verificar se a carta atual está travada
    if (card.getAttribute('data-locked') === 'true') {
        return;  // Impede de trazer para frente, mas continua com a seleção
    }

    // Trazer a carta selecionada para a frente (aumentar o z-index)
    card.style.zIndex = topZIndex++;
    
    // Garantir que as cartas fixadas ainda fiquem no topo
    ensureFixedCardsOnTop();
}





// --------------------------------------------------------------------------------------------------------//






function openCardOptions(card) {
    const cardOptions = document.getElementById('card-options');
    const isFixedOnTop = card.getAttribute('data-fixed-on-top') === 'true';

    // Mostrar o pop-up de opções
    cardOptions.classList.add('show');
    currentElement = card;

    // Desabilitar as opções no pop-up, exceto a rotação, se a carta for "sempre visível"
    if (isFixedOnTop) {
        // Aqui você desativa as opções no pop-up exceto a rotação
        document.getElementById('bring-to-front-option').style.display = 'none';
        document.getElementById('stack-option').style.display = 'none';
    } else {
        // Mostrar todas as opções normalmente
        document.getElementById('bring-to-front-option').style.display = 'block';
        document.getElementById('stack-option').style.display = 'block';
    }
}

// Função para fechar o pop-up de opções
function closeCardOptions() {
    const cardOptions = document.getElementById('card-options');
    cardOptions.classList.remove('show');  // Esconder o popup
}

// Função para trazer para frente alternar o z-index da carta e fechar o popup
function bringCardToFront() {
    if (!currentElement) return;

    const isFixedOnTop = currentElement.getAttribute('data-fixed-on-top') === 'true';

    if (isFixedOnTop) {
        currentElement.removeAttribute('data-fixed-on-top');
        currentElement.style.zIndex = 0;
        currentElement.style.border = ''; // Remover borda branca
        currentElement.setAttribute('data-at-top', 'false');
    } else {
        topZIndex += 1;  // Elevar o z-index global para manter esta carta no topo
        currentElement.style.zIndex = topZIndex;
        currentElement.setAttribute('data-fixed-on-top', 'true'); // Marcar como sempre visível
        currentElement.setAttribute('data-at-top', 'true');
       currentElement.style.border = '2px solid rgba(255, 255, 255, 0.1)'; // Borda branca com 50% de transparência
  }

    //closeCardOptions();
}

// Função para garantir que as cartas fixadas no topo mantenham o maior z-index
function ensureFixedCardsOnTop() {
    const fixedCards = document.querySelectorAll('[data-fixed-on-top="true"]');
    fixedCards.forEach(card => {
        topZIndex += 1;
        card.style.zIndex = topZIndex;  // Garantir que a carta fixada sempre tenha o maior z-index
    });
}

function rotateCard() {
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Impede se a carta estiver travada
    }

    // Obter o valor atual da rotação e da escala
    let rotation = parseInt(selectedCard.getAttribute('data-rotation')) || 0;
    let scale = parseFloat(selectedCard.getAttribute('data-scale')) || 1;

    rotation += 45;  // Incrementa a rotação

    // Aplica a rotação e mantém a escala
    selectedCard.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    // Atualiza os atributos com os novos valores
    selectedCard.setAttribute('data-rotation', rotation);  // Armazena o novo valor de rotação
}




// --------------------------------------------------------------------------------------------------------//






// Função para iniciar o arraste com o mouse (cartas)
function onMouseDown(event) {
    if (event.target.classList.contains('card')) {
        event.preventDefault();
        currentElement = event.target;

        const rect = currentElement.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        // Selecionar a carta quando o arraste começar
        selectCardOnTable(currentElement);

        isDragging = true;
    
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        startAutoScroll();  // Iniciar o auto-scroll ao começar o arraste
    }
}

// Função para mover a carta com o mouse
function onMouseMove(event) {
    if (!isDragging) return;

    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
       // alert("Esta carta está travada!");
        return;  // Impede se a carta estiver travada
    }
    
    const tableArea = document.getElementById('table-area');
    const tableRect = tableArea.getBoundingClientRect();

  // Obtém o nível de zoom (escala) da carta diretamente do estilo transform
let scale = parseFloat(currentElement.getAttribute('data-scale')) || 1;

//Minha magica, baseada no zoom autal da mesa calculo valors para melhorar o centramento do movimento
//let porcentagem = 1500;  // Definimos a porcentagem que queremos (ex: 50%)
 // Condicional para ajustar o valor de 'porcentagem' baseado no 'zoomLevel'
   //    if (zoomLevel < 1) {
     //   porcentagem = -3500;
   // }
//let teste = zoomLevel * (porcentagem / 100);  // Define o valor de 'teste' como % do zoomLevel

 // Calcula a nova posição com base no centro da carta
 //  let newLeft = (event.clientX - tableRect.left - (currentElement.offsetWidth / 2)) / zoomLevel;
   // let newTop = (event.clientY - tableRect.top - (currentElement.offsetHeight / 2)) / zoomLevel;

   let newLeft = (event.clientX - tableRect.left - offsetX) / zoomLevel;
  let newTop = (event.clientY - tableRect.top - offsetY) / zoomLevel;

    const maxLeft = (tableRect.width - currentElement.offsetWidth) / zoomLevel;
    const maxTop = (tableRect.height - currentElement.offsetHeight) / zoomLevel;

    currentElement.style.left = `${Math.min(Math.max(newLeft, 0), maxLeft)}px`;
    currentElement.style.top = `${Math.min(Math.max(newTop, 0), maxTop)}px`;

    // Chamar a função de auto-scroll enquanto move
    handleAutoScroll(event.clientX, event.clientY);
}

// Função para finalizar o arraste com o mouse
function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    stopAutoScroll();  // Parar o auto-scroll ao finalizar o arraste
}

// Função para iniciar o toque (arraste de cartas com toque)
function onTouchStart(event) {
    if (event.target.classList.contains('card')) {
        event.preventDefault();
        const touch = event.touches[0];
        currentElement = event.target;

        const rect = currentElement.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        // Selecionar a carta ao iniciar o toque
        selectCardOnTable(currentElement);

        isDragging = true;

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);

        startAutoScroll();  // Iniciar o auto-scroll ao começar o toque
    }
}

// Função para mover a carta com o toque
function onTouchMove(event) {
    if (!isDragging) return;

    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        //alert("Esta carta está travada!");
        return;  // Impede se a carta estiver travada
    }
    
    const touch = event.touches[0];
    const tableArea = document.getElementById('table-area');
    const tableRect = tableArea.getBoundingClientRect();

    let newLeft = (touch.clientX - tableRect.left - offsetX) / zoomLevel;
    let newTop = (touch.clientY - tableRect.top - offsetY) / zoomLevel;

    const maxLeft = (tableRect.width - currentElement.offsetWidth) / zoomLevel;
    const maxTop = (tableRect.height - currentElement.offsetHeight) / zoomLevel;

    currentElement.style.left = `${Math.min(Math.max(newLeft, 0), maxLeft)}px`;
    currentElement.style.top = `${Math.min(Math.max(newTop, 0), maxTop)}px`;

    // Chamar a função de auto-scroll enquanto move
    handleAutoScroll(touch.clientX, touch.clientY);
}

// Função para finalizar o arraste com toque
function onTouchEnd() {
    isDragging = false;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);

    stopAutoScroll();  // Parar o auto-scroll ao finalizar o toque
}





// --------------------------------------------------------------------------------------------------------//





// Função para iniciar o auto-scroll da mesa
function startAutoScroll() {
    if (!autoScrollInterval) {
        autoScrollInterval = setInterval(() => {
            const tableWrapper = document.getElementById('table-wrapper');

            if (scrollDirection === 'up') {
                tableWrapper.scrollTop -= 10;
            } else if (scrollDirection === 'down') {
                tableWrapper.scrollTop += 10;
            }

            if (scrollDirection === 'left') {
                tableWrapper.scrollLeft -= 10;
            } else if (scrollDirection === 'right') {
                tableWrapper.scrollLeft += 10;
            }
        }, 30);
    }
}

// Função para parar o auto-scroll da mesa
function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Variável para armazenar a direção do scroll
let scrollDirection = null;

// Função para verificar se o cursor está próximo das bordas e definir a direção do auto-scroll
function handleAutoScroll(clientX, clientY) {
    const tableWrapper = document.getElementById('table-wrapper');
    const rect = tableWrapper.getBoundingClientRect();

    const edgeThreshold = 50; // Distância da borda para iniciar o scroll

    // Verificar as bordas horizontais
    if (clientX < rect.left + edgeThreshold) {
        scrollDirection = 'left';
    } else if (clientX > rect.right - edgeThreshold) {
        scrollDirection = 'right';
    } else {
        scrollDirection = null;
    }

    // Verificar as bordas verticais
    if (clientY < rect.top + edgeThreshold) {
        scrollDirection = 'up';
    } else if (clientY > rect.bottom - edgeThreshold) {
        scrollDirection = 'down';
    } else if (!scrollDirection) {
        scrollDirection = null;
    }
}

// Função para finalizar o arraste com toque 
function onTouchEnd() {
    isDragging = false;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    
    stopAutoScroll();  // Parar o auto-scroll ao finalizar o toque
}




// --------------------------------------------------------------------------------------------------------//





// Função para arrastar a mesa (área vazia)
const tableWrapper = document.getElementById('table-wrapper');

// Função para iniciar o arraste da mesa (mouse)
tableWrapper.addEventListener('mousedown', (e) => {
    // Permitir arrastar a mesa se o clique for em uma área vazia ou em uma carta travada
    if (!e.target.classList.contains('card') || e.target.getAttribute('data-locked') === 'true') {
        isDraggingTable = true;
        tableStartX = e.pageX - tableWrapper.offsetLeft;
        tableStartY = e.pageY - tableWrapper.offsetTop;
        scrollLeft = tableWrapper.scrollLeft;
        scrollTop = tableWrapper.scrollTop;
        tableWrapper.style.cursor = 'grabbing';
    }
});

// Função para mover a mesa com o mouse
tableWrapper.addEventListener('mousemove', (e) => {
    if (isDraggingTable) {
        e.preventDefault();
        const x = e.pageX - tableWrapper.offsetLeft;
        const y = e.pageY - tableWrapper.offsetTop;
        tableWrapper.scrollLeft = scrollLeft - (x - tableStartX);
        tableWrapper.scrollTop = scrollTop - (y - tableStartY);
    }
});

// Função para finalizar o arraste da mesa com o mouse
tableWrapper.addEventListener('mouseup', () => {
    isDraggingTable = false;
    tableWrapper.style.cursor = 'grab';
});

// Função para iniciar o arraste da mesa (toque em dispositivos móveis)
tableWrapper.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    // Permitir arrastar a mesa se o toque for em uma área vazia ou em uma carta travada
    if (!touch.target.classList.contains('card') || touch.target.getAttribute('data-locked') === 'true') {
        isDraggingTable = true;
        tableStartX = touch.pageX - tableWrapper.offsetLeft;
        tableStartY = touch.pageY - tableWrapper.offsetTop;
        scrollLeft = tableWrapper.scrollLeft;
        scrollTop = tableWrapper.scrollTop;
        tableWrapper.style.cursor = 'grabbing';
    }
});

// Função para mover a mesa com toque (dispositivos móveis)
tableWrapper.addEventListener('touchmove', (e) => {
    if (isDraggingTable) {
        const touch = e.touches[0];
        const x = touch.pageX - tableWrapper.offsetLeft;
        const y = touch.pageY - tableWrapper.offsetTop;
        tableWrapper.scrollLeft = scrollLeft - (x - tableStartX);
        tableWrapper.scrollTop = scrollTop - (y - tableStartY);
    }
});

// Função para finalizar o arraste da mesa com toque (dispositivos móveis)
tableWrapper.addEventListener('touchend', () => {
    isDraggingTable = false;
    tableWrapper.style.cursor = 'grab';
});





// --------------------------------------------------------------------------------------------------------//






// Função para redimensionar a carta, mantendo a rotação atual
function resizeCard(action) {
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Impede se a carta estiver travada
    }

    let scale = parseFloat(selectedCard.getAttribute('data-scale')) || 1;
    
    if (action === 'increase' && scale < 2) {
        scale += 0.1; 
    } else if (action === 'decrease' && scale > 0.1) {
        scale -= 0.1; 
    }

       let rotation = parseInt(currentElement.getAttribute('data-rotation')) || 0;

    currentElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    currentElement.setAttribute('data-scale', scale);
}





// --------------------------------------------------------------------------------------------------------//







// Função para ajustar o zoom da mesa
function adjustZoom(action) {
    const tableArea = document.getElementById('table-area');
    const zoomStep = 0.2;

    if (action === 'increase' && zoomLevel < 3.2) {
        zoomLevel += zoomStep;
    } else if (action === 'decrease' && zoomLevel > 0.5) {
        zoomLevel -= zoomStep;
    }

    tableArea.style.transform = `scale(${zoomLevel})`;
    tableArea.style.transformOrigin = 'top left';
}

// Função para reembaralhar um deck e remover cartas da mesa
function reshuffleDeck(deckNumber) {
    const confirmReshuffle = confirm(`Tem certeza de que deseja reembaralhar o Deck ${deckNumber} e remover suas cartas da mesa?`);
    if (!confirmReshuffle) return;

    allDecks[deckNumber] = generateDeckImages(deckNumber, numCardsPerDeck[deckNumber - 1]);
    shuffle(allDecks[deckNumber]);

    const tableArea = document.getElementById('table-area');
    const cards = tableArea.querySelectorAll(`img[data-deck="${deckNumber}"]`);
    cards.forEach(card => tableArea.removeChild(card));

    alert(`Deck ${deckNumber} reembaralhado e cartas removidas da mesa!`);
}

// Função para embaralhar um array (embaralha um deck)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}






//----------------------------------------------------------------------------


// Função para abrir o seletor de cartas
function openCardSelector(deckNumber) {
    const selector = document.getElementById('card-selector');
    const selectorContent = document.getElementById('card-selector-content');
    selectorContent.innerHTML = ''; // Limpar o conteúdo anterior

    // Obter todas as cartas disponíveis no deck
    let deck = allDecks[deckNumber];

    // Obter as cartas que já estão na mesa, para o deck atual
    const cardsOnTable = Array.from(document.querySelectorAll(`.card[data-deck="${deckNumber}"]`))
                              .map(card => card.src.split('/').pop()); // Pegamos apenas o nome do arquivo

    // Filtrar as cartas que ainda estão disponíveis, removendo as que já estão na mesa
    const availableCards = deck.filter(card => !cardsOnTable.includes(card.split('/').pop()));

    // Exibir as cartas disponíveis no popup
    availableCards.forEach(card => {
        const cardImg = document.createElement('img');
      cardImg.src = card;
     //   cardImg.classList.add('card-thumbnail');
          // Forçar o recarregamento da imagem com um cache busting
     //   const timestamp = new Date().getTime();  // Gera um timestamp único
        //cardImg.src = `${card}?t=${timestamp}`;  // Força o recarregamento com cache busting
        
        cardImg.classList.add('card-thumbnail');




 // Adicionar o tratamento de erro na imagem
        cardImg.onerror = function() {
            const src = cardImg.src.split('?')[0];  // Remove o cache busting anterior
            const timestamp = new Date().getTime();  // Gera um novo timestamp
            cardImg.src = `${src}?t=${timestamp}`;  // Recarrega a imagem
        };






        // Adicionar o evento de clique para selecionar a carta
        cardImg.onclick = function() {
            chooseCardFromSelector(deckNumber, card); // Remover a carta e atualizar
        };
        selectorContent.appendChild(cardImg);
    });

    // Mostrar o seletor de cartas
    selector.classList.remove('hidden');
}







// Função para selecionar uma carta do popup e colocá-la na mesa
function chooseCardFromSelector(deckNumber, cardSrc) {
    // Colocar a carta na mesa
    placeCardOnTable(deckNumber, cardSrc);

    // Remover a carta do deck para que não possa ser sorteada novamente
    allDecks[deckNumber] = allDecks[deckNumber].filter(card => card !== cardSrc);

    // Fechar o seletor de cartas
    closeCardSelector();

    // Reabrir o popup com as cartas restantes
    openCardSelector(deckNumber);
}

// Função para fechar o seletor de cartas
function closeCardSelector() {
    const selector = document.getElementById('card-selector');
    selector.classList.add('hidden');
}








// --------------------------------------------------------------------------------------------------------//








// Função para embaralhar um array (mantida do código original)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}





// --------------------------------------------------------------------------------------------------------//







// Função para reembaralhar um deck e remover cartas da mesa
function reshuffleDeck(deckNumber) {
    const confirmReshuffle = confirm(`Tem certeza de que deseja reembaralhar o Deck ${deckNumber} e remover suas cartas da mesa?`);
    if (!confirmReshuffle) return;

    allDecks[deckNumber] = generateDeckImages(deckNumber, numCardsPerDeck[deckNumber - 1]);
    shuffle(allDecks[deckNumber]);

    const tableArea = document.getElementById('table-area');
    const cards = tableArea.querySelectorAll(`img[data-deck="${deckNumber}"]`);
    
    // Remover as cartas da mesa e restaurar o estado original
    cards.forEach(card => {
       // card.style.transform = 'rotate(0deg) scale(1)';  // Voltar ao estado original
        card.style.zIndex = '';  // Resetar z-index
        card.style.width = '';   // Resetar largura
        card.style.height = '';  // Resetar altura

        // Remover atributos customizados
        card.removeAttribute('data-rotation');
        card.removeAttribute('data-scale');
        card.removeAttribute('data-fixed-on-top');

        // Remover classes e propriedades
        card.classList.remove('selected');
        card.remove(); // Remover da mesa
    });

    alert(`Deck ${deckNumber} reembaralhado e cartas removidas da mesa!`);
}



let longPressTimeout; // Controla o tempo do clique/toque longo
let isLongPress = false; // Flag para verificar se o long press foi ativado

// Função para lidar com clique/toque longo
function handleLongPress(card) {
    longPressTimeout = setTimeout(() => {
        isLongPress = true; // Marca que o long press foi ativado
        openCardPopup(card); // Abre a janela pop-up com a carta ampliada
    }, 500); // 500ms para considerar toque longo
}

// Função para cancelar o long press se o usuário liberar o botão ou arrastar
function clearLongPressTimeout() {
    clearTimeout(longPressTimeout); // Cancela o timer do long press
    isLongPress = false; // Resetar o estado de long press
}

// Função para abrir uma nova janela pop-up com a carta ampliada
function openCardPopup(card) {
    const popupWidth = 400; // Largura da janela pop-up
    const popupHeight = 600; // Altura da janela pop-up
    const popupLeft = (window.innerWidth - popupWidth) / 2; // Centralizar horizontalmente
    const popupTop = (window.innerHeight - popupHeight) / 2; // Centralizar verticalmente

    // Abre uma nova janela pop-up
    const popupWindow = window.open(
        '',
        'Carta Ampliada',
        `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop}`
    );

    // Adiciona o conteúdo da carta ampliada e um botão de fechar na nova janela pop-up
    popupWindow.document.write(`
        <html>
        <head>
            <title>Carta Ampliada</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    margin: 0;
                    background-color: #f0f0f0;
                }
                img {
                    max-width: 100%;
                    max-height: 80%; /* Para deixar espaço para o botão */
                }
                button {
                    margin-top: 10px;
                    padding: 10px 20px;
                    background-color: #333;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #555;
                }
            </style>
        </head>
        <body>
            <div>
                <img src="${card.src}" alt="Carta Ampliada">
                <button onclick="window.close()">Fechar</button> <!-- Botão que fecha a janela -->
            </div>
        </body>
        </html>
    `);

    popupWindow.document.close(); // Finaliza o stream da página

    // Após fechar o pop-up, remover o foco/seleção da carta
    popupWindow.onunload = () => {
       // card.classList.remove('selected'); // Remove a classe de seleção da carta
        
        //desabilita o arrastar a carta sekeciinada para evitar conflitos ao clicar na nesa novamente
        isDragging = null;
    };
}









// --------------------------------------------------------------------------------------------------------//







//Função para travar uma carta na mesa
function toggleLockCard() {
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

    // Alternar o estado de travamento
    const isCurrentlyLocked = selectedCard.getAttribute('data-locked') === 'true';

    if (!isCurrentlyLocked) {
        selectedCard.setAttribute('data-locked', 'true');  // Marca a carta como travada
        selectedCard.classList.add('locked');  // Adiciona uma classe de visualização
        selectedCard.setAttribute('draggable', 'false');  // Desabilita o arraste

       // selectedCard.style.border = "2px solid black";  // Indicar visualmente que está travada
       
     alert("Carta travada!");
        
        // Fechar o popup de opções automaticamente
    closeCardOptions();
    } else {
        selectedCard.setAttribute('data-locked', 'false');  // Marca a carta como destravada
        selectedCard.classList.remove('locked');  // Remove a classe de visualização
        selectedCard.setAttribute('draggable', 'true');  // Reabilita o arraste

        selectedCard.style.border = "";  // Remove o indicador visual
        alert("Carta destravada!");
        
        // Fechar o popup de opções automaticamente
    closeCardOptions();
    }
}




// --------------------------------------------------------------------------------------------------------//





function groupAndFlipCards() {
    // Garantir que existe uma carta selecionada
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

    // Impedir a função se a carta estiver travada
    if (selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;
    }

    closeCardOptions();  // Fechar popup de opções

    const allCards = Array.from(document.querySelectorAll('.card:not(.dice)'));
    const selectedCardRect = selectedCard.getBoundingClientRect();
    const captureMargin = selectedCardRect.height / 2.5;  // Definir a margem relativa

    const cardsToMove = [selectedCard];  // Iniciar com a carta selecionada

    // Iterar sobre todas as cartas e agrupar as que estão próximas
    allCards.forEach(card => {
        if (card !== selectedCard) {
            const cardRect = card.getBoundingClientRect();

            const isCloseVertically = Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin;
            const isCloseHorizontally = Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin;

            if (isCloseVertically && isCloseHorizontally) {
                cardsToMove.push(card);
            }
        }
    });

    // Função para virar uma carta
    function flipCardIndividually(card) {
        const isFlipped = card.getAttribute('data-flipped') === 'true';
        if (isFlipped) {
            // Mostrar a frente (reverter)
            const originalCardSrc = card.getAttribute('data-original-src');  // Obter frente original
            card.setAttribute('src', originalCardSrc);
            card.setAttribute('data-flipped', 'false');
        } else {
            // Mostrar as costas específicas da carta
            const originalCardSrc = card.getAttribute('data-original-src');
            const backSrc = originalCardSrc.replace('.jpeg', 'back.jpeg');  // Substituir pela imagem de costas
            card.setAttribute('src', backSrc);
            card.setAttribute('data-flipped', 'true');
        }
    }

    // Virar todas as cartas agrupadas
    cardsToMove.forEach(card => {
        flipCardIndividually(card);  // Chama a função para virar individualmente
    });

    // Agora as cartas estão agrupadas e viradas corretamente





    // Zerar as transformações de todas as cartas antes de movê-las, mas preservar a posição
    cardsToMove.forEach(card => {
        // Zerar as transformações de rotação e redimensionamento, mas manter a posição (left, top)
       // card.style.transform = 'rotate(0deg) scale(1)';
        card.style.position = 'absolute'; // Garante que a posição é absoluta
    });

    // ** Definir a posição inicial para mover o deck **
    let startX, startY, offsetX, offsetY;
    offsetX = (selectedCardRect.left - tableRect.left) / zoomLevel;
    offsetY = (selectedCardRect.top - tableRect.top) / zoomLevel;

    // Variáveis para armazenar o deslocamento do scroll da mesa
    let initialScrollLeft = tableWrapper.scrollLeft;
    let initialScrollTop = tableWrapper.scrollTop;

    // Função de movimento para as cartas (com mouse)
    function onDeckMove(event) {
        const deltaX = (event.clientX - startX) / zoomLevel;
        const deltaY = (event.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(event.clientX, event.clientY);
    }

    // Função de movimento para as cartas (com toque)
    function onDeckTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = (touch.clientX - startX) / zoomLevel;
        const deltaY = (touch.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(touch.clientX, touch.clientY);
    }

    // Iniciar o movimento com o mouse
    document.addEventListener('mousemove', onDeckMove);
    document.addEventListener('mouseup', stopDeckMove);

    // Iniciar o movimento com o toque
    document.addEventListener('touchmove', onDeckTouchMove);
    document.addEventListener('touchend', stopDeckMove);

    // Definir a posição inicial do movimento
    function startMove(event) {
        if (event.type === 'mousedown') {
            startX = event.clientX;
            startY = event.clientY;
        } else if (event.type === 'touchstart') {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }
    }

    // Parar o movimento
    function stopDeckMove() {
        document.removeEventListener('mousemove', onDeckMove);
        document.removeEventListener('mouseup', stopDeckMove);
        document.removeEventListener('touchmove', onDeckTouchMove);
        document.removeEventListener('touchend', stopDeckMove);
        document.removeEventListener('mousedown', startMove);
        document.removeEventListener('touchstart', startMove);
    }

    // Adicionar o evento para iniciar o movimento
    document.addEventListener('mousedown', startMove);
    document.addEventListener('touchstart', startMove);

    // Função para reordenar as cartas com base no z-index
    function reorderCards(cards) {
        return cards.sort((a, b) => {
            const zIndexA = parseInt(window.getComputedStyle(a).zIndex) || 0; // Obtém o z-index da carta A
            const zIndexB = parseInt(window.getComputedStyle(b).zIndex) || 0; // Obtém o z-index da carta B
            return zIndexA - zIndexB; // Ordena pelo z-index
        });
    }

    // Reordene as cartas agrupadas antes de simular os cliques
    const orderedCardsToMove = reorderCards(cardsToMove);

    // Simular o clique nas cartas reordenadas
    orderedCardsToMove.forEach(card => {
        card.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
     });


}









// --------------------------------------------------------------------------------------------------------//





// Função para agrupar e mover cartas sem alterar nunhuma transformação feita!
function moveDeck() {
    // Garantir que existe uma carta selecionada
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }
    
    
      //trava funcao se cartatravada
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Impede  se a carta estiver travada
    }
    
    

    // Fechar o popup de opções automaticamente
    closeCardOptions();

    const allCards = Array.from(document.querySelectorAll('.card:not(.dice)')); // Filtra dados
    const selectedCardRect = selectedCard.getBoundingClientRect();
    const tableRect = document.getElementById('table-area').getBoundingClientRect();
    const tableWrapper = document.getElementById('table-wrapper');

    const cardsToMove = [];

    // Definir a margem relativa ao tamanho da carta e ao zoom
    const cardHeight = selectedCardRect.height;  // Altura da carta selecionada
    const captureMargin = cardHeight / 2.5; // Proporção da margem em relação à altura da carta

    // Adicionar a carta guia ao grupo de cartas
    cardsToMove.push(selectedCard);

    // Encontrar a carta guia e adicioná-la ao grupo se estiver visível
    const guideCard = document.querySelector('.guide-card'); // Supondo que a classe da carta guia seja 'guide-card'
    if (guideCard) {
        cardsToMove.push(guideCard); // Adiciona a carta guia
    }

    // Encontrar as cartas que estão abaixo da carta selecionada e dentro do alcance
    let selectedCardIndex = allCards.indexOf(selectedCard);
    
    // Iterar sobre as cartas a partir da carta selecionada
    for (let i = selectedCardIndex + 1; i < allCards.length; i++) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.push(card); // Adicionar ao grupo de cartas a serem movidas
        }
    }

    // Iterar sobre as cartas acima da carta selecionada
    for (let i = selectedCardIndex - 1; i >= 0; i--) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.unshift(card); // Adicionar ao grupo de cartas a serem movidas no início do array
        }
    }

    // Zerar as transformações de todas as cartas antes de movê-las, mas preservar a posição
    cardsToMove.forEach(card => {
        // Zerar as transformações de rotação e redimensionamento, mas manter a posição (left, top)
       // card.style.transform = 'rotate(0deg) scale(1)';
        card.style.position = 'absolute'; // Garante que a posição é absoluta
    });

    // Função para reordenar as cartas com base no z-index
    function reorderCards(cards) {
        return cards.sort((a, b) => {
            const zIndexA = parseInt(window.getComputedStyle(a).zIndex) || 0; // Obtém o z-index da carta A
            const zIndexB = parseInt(window.getComputedStyle(b).zIndex) || 0; // Obtém o z-index da carta B
            
            return zIndexA - zIndexB; // Ordena pelo z-index
        });
    }

    // Reordene as cartas agrupadas antes de simular os cliques
    const orderedCardsToMove = reorderCards(cardsToMove);

    // Simular o clique nas cartas reordenadas
    orderedCardsToMove.forEach(card => {
        card.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    });

    // ** Definir a posição inicial para mover o deck **
    let startX, startY, offsetX, offsetY;
    offsetX = (selectedCardRect.left - tableRect.left) / zoomLevel;
    offsetY = (selectedCardRect.top - tableRect.top) / zoomLevel;

    // Variáveis para armazenar o deslocamento do scroll da mesa
    let initialScrollLeft = tableWrapper.scrollLeft;
    let initialScrollTop = tableWrapper.scrollTop;

    // Função de movimento para as cartas (com mouse)
    function onDeckMove(event) {
        const deltaX = (event.clientX - startX) / zoomLevel;
        const deltaY = (event.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(event.clientX, event.clientY);
    }

    // Função de movimento para as cartas (com toque)
    function onDeckTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = (touch.clientX - startX) / zoomLevel;
        const deltaY = (touch.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(touch.clientX, touch.clientY);
    }

    // Iniciar o movimento com o mouse
    document.addEventListener('mousemove', onDeckMove);
    document.addEventListener('mouseup', stopDeckMove);

    // Iniciar o movimento com o toque
    document.addEventListener('touchmove', onDeckTouchMove);
    document.addEventListener('touchend', stopDeckMove);

    // Definir a posição inicial do movimento
    function startMove(event) {
        if (event.type === 'mousedown') {
            startX = event.clientX;
            startY = event.clientY;
        } else if (event.type === 'touchstart') {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }
    }

    // Parar o movimento
    function stopDeckMove() {
        document.removeEventListener('mousemove', onDeckMove);
        document.removeEventListener('mouseup', stopDeckMove);
        document.removeEventListener('touchmove', onDeckTouchMove);
        document.removeEventListener('touchend', stopDeckMove);
        document.removeEventListener('mousedown', startMove);
        document.removeEventListener('touchstart', startMove);
    }

    // Adicionar o evento para iniciar o movimento
    document.addEventListener('mousedown', startMove);
    document.addEventListener('touchstart', startMove);
}






// --------------------------------------------------------------------------------------------------------//








// Função para agrupar e reembaralhar mover cartas, zerando a rotação e redimensionamento, mas alinhando uma sobre a outra
function stackCards() {
     // Garantir que existe uma carta selecionada
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }
    
      //trava funcao se cartatravada
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Impede se a carta estiver travada
    }
    
    

    // Fechar o popup de opções automaticamente
    closeCardOptions();

    const allCards = Array.from(document.querySelectorAll('.card:not(.dice)')); // Filtra dados
    // ... O restante do seu código continua aqui
    const selectedCardRect = selectedCard.getBoundingClientRect();
    const tableRect = document.getElementById('table-area').getBoundingClientRect();
    const tableWrapper = document.getElementById('table-wrapper');

    const cardsToMove = [];

    // Definir a margem relativa ao tamanho da carta e ao zoom
    const cardHeight = selectedCardRect.height;  // Altura da carta selecionada
    const captureMargin = cardHeight / 2.5; // Proporção da margem em relação à altura da carta

    // Adicionar a carta guia ao grupo de cartas
    cardsToMove.push(selectedCard);

    // Encontrar a carta guia e adicioná-la ao grupo se estiver visível
    const guideCard = document.querySelector('.guide-card'); // Supondo que a classe da carta guia seja 'guide-card'
    if (guideCard) {
        cardsToMove.push(guideCard); // Adiciona a carta guia
    }

    // Encontrar as cartas que estão abaixo da carta selecionada e dentro do alcance
    let selectedCardIndex = allCards.indexOf(selectedCard);
    
    // Iterar sobre as cartas a partir da carta selecionada
    for (let i = selectedCardIndex + 1; i < allCards.length; i++) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.push(card); // Adicionar ao grupo de cartas a serem movidas
        }
    }

    // Iterar sobre as cartas acima da carta selecionada
    for (let i = selectedCardIndex - 1; i >= 0; i--) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.unshift(card); // Adicionar ao grupo de cartas a serem movidas no início do array
        }
    }

    // Zerar as transformações de todas as cartas antes de movê-las, mas preservar a posição
    cardsToMove.forEach(card => {
        // Zerar as transformações de rotação e redimensionamento, mas manter a posição (left, top)
        //card.style.transform = 'rotate(0deg) scale(1)';
        card.style.position = 'absolute'; // Garante que a posição é absoluta
    });

    // Função para reordenar as cartas com base no z-index
    function reorderCards(cards) {
        return cards.sort((a, b) => {
            const zIndexA = parseInt(window.getComputedStyle(a).zIndex) || 0; // Obtém o z-index da carta A
            const zIndexB = parseInt(window.getComputedStyle(b).zIndex) || 0; // Obtém o z-index da carta B
            
            return zIndexA - zIndexB; // Ordena pelo z-index
        });
    }

    // Função para embaralhar as cartas
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Reordene as cartas agrupadas antes de simular os cliques
    const orderedCardsToMove = reorderCards(cardsToMove);

    // Embaralhar as cartas agrupadas
    shuffle(orderedCardsToMove);

    // Simular o clique nas cartas reordenadas
    orderedCardsToMove.forEach(card => {
        card.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    });

    // ** Definir a posição inicial para mover o deck **
    let startX, startY, offsetX, offsetY;
    offsetX = (selectedCardRect.left - tableRect.left) / zoomLevel;
    offsetY = (selectedCardRect.top - tableRect.top) / zoomLevel;

    // Variáveis para armazenar o deslocamento do scroll da mesa
    let initialScrollLeft = tableWrapper.scrollLeft;
    let initialScrollTop = tableWrapper.scrollTop;

    // Função de movimento para as cartas (com mouse)
    function onDeckMove(event) {
        const deltaX = (event.clientX - startX) / zoomLevel;
        const deltaY = (event.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(event.clientX, event.clientY);
    }

    // Função de movimento para as cartas (com toque)
    function onDeckTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = (touch.clientX - startX) / zoomLevel;
        const deltaY = (touch.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(touch.clientX, touch.clientY);
    }

    // Iniciar o movimento com o mouse
    document.addEventListener('mousemove', onDeckMove);
    document.addEventListener('mouseup', stopDeckMove);

    // Iniciar o movimento com o toque
    document.addEventListener('touchmove', onDeckTouchMove);
    document.addEventListener('touchend', stopDeckMove);

    // Definir a posição inicial do movimento
    function startMove(event) {
        if (event.type === 'mousedown') {
            startX = event.clientX;
            startY = event.clientY;
        } else if (event.type === 'touchstart') {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }
    }

    // Parar o movimento
    function stopDeckMove() {
        document.removeEventListener('mousemove', onDeckMove);
        document.removeEventListener('mouseup', stopDeckMove);
        document.removeEventListener('touchmove', onDeckTouchMove);
        document.removeEventListener('touchend', stopDeckMove);
        document.removeEventListener('mousedown', startMove);
        document.removeEventListener('touchstart', startMove);
    }

    // Adicionar o evento para iniciar o movimento
    document.addEventListener('mousedown', startMove);
    document.addEventListener('touchstart', startMove);
}




// --------------------------------------------------------------------------------------------------------//






// Função para agrupar e trazer frente
function Agruparetrazerfrente() {
     // Garantir que existe uma carta selecionada
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }
    
      //trava funcao se cartatravada
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Impede se a carta estiver travada
    }
    
    

    // Fechar o popup de opções automaticamente
    closeCardOptions();

    const allCards = Array.from(document.querySelectorAll('.card:not(.dice)')); // Filtra dados
    const selectedCardRect = selectedCard.getBoundingClientRect();
    const tableRect = document.getElementById('table-area').getBoundingClientRect();
    const tableWrapper = document.getElementById('table-wrapper');

    const cardsToMove = [];

    // Definir a margem relativa ao tamanho da carta e ao zoom
    const cardHeight = selectedCardRect.height;  // Altura da carta selecionada
    const captureMargin = cardHeight / 2.5; // Proporção da margem em relação à altura da carta

    // Adicionar a carta guia ao grupo de cartas
    cardsToMove.push(selectedCard);

    // Encontrar a carta guia e adicioná-la ao grupo se estiver visível
    const guideCard = document.querySelector('.guide-card'); // Supondo que a classe da carta guia seja 'guide-card'
    if (guideCard) {
        cardsToMove.push(guideCard); // Adiciona a carta guia
    }

    // Encontrar as cartas que estão abaixo da carta selecionada e dentro do alcance
    let selectedCardIndex = allCards.indexOf(selectedCard);
    
    // Iterar sobre as cartas a partir da carta selecionada
    for (let i = selectedCardIndex + 1; i < allCards.length; i++) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.push(card); // Adicionar ao grupo de cartas a serem movidas
        }
    }

    // Iterar sobre as cartas acima da carta selecionada
    for (let i = selectedCardIndex - 1; i >= 0; i--) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.unshift(card); // Adicionar ao grupo de cartas a serem movidas no início do array
        }
    }

    // Zerar as transformações de todas as cartas antes de movê-las, mas preservar a posição
    cardsToMove.forEach(card => {
        // Zerar as transformações de rotação e redimensionamento, mas manter a posição (left, top)
        //card.style.transform = 'rotate(0deg) scale(1)';
        card.style.position = 'absolute'; // Garante que a posição é absoluta



 if (!card) return;

    const isFixedOnTop = card.getAttribute('data-fixed-on-top') === 'true';

    if (isFixedOnTop) {
       card.removeAttribute('data-fixed-on-top');
        card.style.zIndex = 0;
       card.style.border = ''; // Remover borda branca
        card.setAttribute('data-at-top', 'false');
    } else {
        topZIndex += 1;  // Elevar o z-index global para manter esta carta no topo
        card.style.zIndex = topZIndex;
        card.setAttribute('data-fixed-on-top', 'true'); // Marcar como sempre visível
        card.setAttribute('data-at-top', 'true');
       card.style.border = '2px solid rgba(255, 255, 255, 0.2)'; // Borda branca com 50% de transparência
  }


    });

    // Função para reordenar as cartas com base no z-index
    function reorderCards(cards) {
        return cards.sort((a, b) => {
            const zIndexA = parseInt(window.getComputedStyle(a).zIndex) || 0; // Obtém o z-index da carta A
            const zIndexB = parseInt(window.getComputedStyle(b).zIndex) || 0; // Obtém o z-index da carta B
            
            return zIndexA - zIndexB; // Ordena pelo z-index
        });
    }

    // Função para embaralhar as cartas
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Reordene as cartas agrupadas antes de simular os cliques
    const orderedCardsToMove = reorderCards(cardsToMove);

    // Embaralhar as cartas agrupadas
    shuffle(orderedCardsToMove);

    // Simular o clique nas cartas reordenadas
    orderedCardsToMove.forEach(card => {
        card.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    });

    // ** Definir a posição inicial para mover o deck **
    let startX, startY, offsetX, offsetY;
    offsetX = (selectedCardRect.left - tableRect.left) / zoomLevel;
    offsetY = (selectedCardRect.top - tableRect.top) / zoomLevel;

    // Variáveis para armazenar o deslocamento do scroll da mesa
    let initialScrollLeft = tableWrapper.scrollLeft;
    let initialScrollTop = tableWrapper.scrollTop;

    // Função de movimento para as cartas (com mouse)
    function onDeckMove(event) {
        const deltaX = (event.clientX - startX) / zoomLevel;
        const deltaY = (event.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(event.clientX, event.clientY);
    }

    // Função de movimento para as cartas (com toque)
    function onDeckTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = (touch.clientX - startX) / zoomLevel;
        const deltaY = (touch.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(touch.clientX, touch.clientY);
    }

    // Iniciar o movimento com o mouse
    document.addEventListener('mousemove', onDeckMove);
    document.addEventListener('mouseup', stopDeckMove);

    // Iniciar o movimento com o toque
    document.addEventListener('touchmove', onDeckTouchMove);
    document.addEventListener('touchend', stopDeckMove);

    // Definir a posição inicial do movimento
    function startMove(event) {
        if (event.type === 'mousedown') {
            startX = event.clientX;
            startY = event.clientY;
        } else if (event.type === 'touchstart') {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }
    }

    // Parar o movimento
    function stopDeckMove() {
        document.removeEventListener('mousemove', onDeckMove);
        document.removeEventListener('mouseup', stopDeckMove);
        document.removeEventListener('touchmove', onDeckTouchMove);
        document.removeEventListener('touchend', stopDeckMove);
        document.removeEventListener('mousedown', startMove);
        document.removeEventListener('touchstart', startMove);
    }

    // Adicionar o evento para iniciar o movimento
    document.addEventListener('mousedown', startMove);
    document.addEventListener('touchstart', startMove);
}






// --------------------------------------------------------------------------------------------------------//



function zoomGroupSize(action) {
    // Garantir que existe uma carta selecionada
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

      //trava funcao se cartatravada
    if (!selectedCard || selectedCard.getAttribute('data-locked') === 'true') {
        alert("Esta carta está travada!");
        return;  // Impede  se a carta estiver travada
    }
    

    // Fechar o popup de opções automaticamente
    closeCardOptions();

    // Filtra as cartas, excluindo dados
    const allCards = Array.from(document.querySelectorAll('.card')); // Apenas as cartas

    const selectedCardRect = selectedCard.getBoundingClientRect();
    const tableRect = document.getElementById('table-area').getBoundingClientRect();
    const tableWrapper = document.getElementById('table-wrapper');

    const cardsToMove = [];

    // Definir a margem relativa ao tamanho da carta e ao zoom
    const cardHeight = selectedCardRect.height;  // Altura da carta selecionada
    const captureMargin = cardHeight / 2.5; // Proporção da margem em relação à altura da carta

    // Adicionar a carta guia ao grupo de cartas
    cardsToMove.push(selectedCard);

    // Encontrar a carta guia e adicioná-la ao grupo se estiver visível
    const guideCard = document.querySelector('.guide-card'); // Supondo que a classe da carta guia seja 'guide-card'
    if (guideCard) {
        cardsToMove.push(guideCard); // Adiciona a carta guia
    }

    // Encontrar as cartas que estão abaixo da carta selecionada e dentro do alcance
    let selectedCardIndex = allCards.indexOf(selectedCard);
    
    // Iterar sobre as cartas a partir da carta selecionada
    for (let i = selectedCardIndex + 1; i < allCards.length; i++) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.push(card); // Adicionar ao grupo de cartas a serem movidas
        }
    }

    // Iterar sobre as cartas acima da carta selecionada
    for (let i = selectedCardIndex - 1; i >= 0; i--) {
        const card = allCards[i];
        const cardRect = card.getBoundingClientRect();

        const isCloseVertically = (
            Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin ||
            Math.abs(cardRect.bottom - selectedCardRect.bottom) <= captureMargin
        );

        const isCloseHorizontally = (
            Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin ||
            Math.abs(cardRect.right - selectedCardRect.right) <= captureMargin
        );

        // Adicionar a carta ao grupo se estiver próxima
        if (isCloseVertically && isCloseHorizontally) {
            cardsToMove.unshift(card); // Adicionar ao grupo de cartas a serem movidas no início do array
        }
    }

    // Verificar e avisar sobre dados antes de removê-los
    const diceCards = cardsToMove.filter(card => card.classList.contains('dice')); // Filtra os dados
    if (diceCards.length > 0) {
        const diceCardNames = diceCards.map(card => card.textContent || "Dado").join(", ");
        alert(`Dado(s) encontrado(s) nesta pilha! Remova os dados e tente novamente!`);
        return; // finaliza a funcão apos detectar o dado no grupo! as funções abaixo acabam ovbsoletas mas funcionou melhor assim!
        
        // Remover os dados das cartas a serem movidas
        cardsToMove.splice(cardsToMove.indexOf(diceCards[0]), diceCards.length); // Remove os dados encontrados
    }

    // Transformações de todas as cartas antes de movê-las, mas preservar a posição
    cardsToMove.forEach(card => {
        // Zerar as transformações de rotação e redimensionamento, mas manter a posição (left, top)
        card.style.position = 'absolute'; // Garante que a posição é absoluta
    });

    // Diminui ou aumenta todas as cartas
   // Diminui ou aumenta todas as cartas
cardsToMove.forEach(card => {
    // Verificar se a carta é válida
    if (!card) return;

    // Obter a escala atual e a rotação atual da carta
    let scale = parseFloat(card.getAttribute('data-scale')) || 1;
    let rotation = parseInt(card.getAttribute('data-rotation')) || 0;

    // Modifica a escala com base na ação ('increase' ou 'decrease')
    if (action === 'increase' && scale < 2) {
        scale += 0.1; 
    } else if (action === 'decrease' && scale > 0.1) {
        scale -= 0.1; 
    }

    // Aplica a rotação e a nova escala simultaneamente
    card.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    // Atualiza os atributos 'data-scale' e 'data-rotation' com os novos valores
    card.setAttribute('data-scale', scale);
    card.setAttribute('data-rotation', rotation);
});



    // Função para reordenar as cartas com base no z-index
    function reorderCards(cards) {
        return cards.sort((a, b) => {
            const zIndexA = parseInt(window.getComputedStyle(a).zIndex) || 0; // Obtém o z-index da carta A
            const zIndexB = parseInt(window.getComputedStyle(b).zIndex) || 0; // Obtém o z-index da carta B
            
            return zIndexA - zIndexB; // Ordena pelo z-index
        });
    }

    // Reordene as cartas agrupadas antes de simular os cliques
    const orderedCardsToMove = reorderCards(cardsToMove);

    // Simular o clique nas cartas reordenadas
    orderedCardsToMove.forEach(card => {
        card.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    });

    // ** Definir a posição inicial para mover o deck **
    let startX, startY, offsetX, offsetY;
    offsetX = (selectedCardRect.left - tableRect.left) / zoomLevel;
    offsetY = (selectedCardRect.top - tableRect.top) / zoomLevel;

    // Variáveis para armazenar o deslocamento do scroll da mesa
    let initialScrollLeft = tableWrapper.scrollLeft;
    let initialScrollTop = tableWrapper.scrollTop;

    // Função de movimento para as cartas (com mouse)
    function onDeckMove(event) {
        const deltaX = (event.clientX - startX) / zoomLevel;
        const deltaY = (event.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(event.clientX, event.clientY);
    }

    // Função de movimento para as cartas (com toque)
    function onDeckTouchMove(event) {
        const touch = event.touches[0];
        const deltaX = (touch.clientX - startX) / zoomLevel;
        const deltaY = (touch.clientY - startY) / zoomLevel;

        // Calcular o deslocamento do scroll da mesa
        const scrollOffsetX = (tableWrapper.scrollLeft - initialScrollLeft) / zoomLevel;
        const scrollOffsetY = (tableWrapper.scrollTop - initialScrollTop) / zoomLevel;

        // Mover as cartas do deck, mantendo-as agrupadas
        const newLeft = offsetX + deltaX + scrollOffsetX;
        const newTop = offsetY + deltaY + scrollOffsetY; // Permitir movimento vertical

        // Ajuste para garantir que todas as cartas se mantenham na mesma posição
        cardsToMove.forEach((card) => {
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`; // Mantém todas as cartas na mesma altura
        });

        // Iniciar auto-scroll ao chegar próximo às bordas da área visível
        handleAutoScroll(touch.clientX, touch.clientY);
    }

    // Iniciar o movimento com o mouse
    document.addEventListener('mousemove', onDeckMove);
    document.addEventListener('mouseup', stopDeckMove);

    // Iniciar o movimento com o toque
    document.addEventListener('touchmove', onDeckTouchMove);
    document.addEventListener('touchend', stopDeckMove);

    // Definir a posição inicial do movimento
    function startMove(event) {
        if (event.type === 'mousedown') {
            startX = event.clientX;
            startY = event.clientY;
        } else if (event.type === 'touchstart') {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }
    }

    // Parar o movimento
    function stopDeckMove() {
        document.removeEventListener('mousemove', onDeckMove);
        document.removeEventListener('mouseup', stopDeckMove);
        document.removeEventListener('touchmove', onDeckTouchMove);
        document.removeEventListener('touchend', stopDeckMove);
        document.removeEventListener('mousedown', startMove);
        document.removeEventListener('touchstart', startMove);
    }

    // Adicionar o evento para iniciar o movimento
    document.addEventListener('mousedown', startMove);
    document.addEventListener('touchstart', startMove);
}






// --------------------------------------------------------------------------------------------------------//







// Função para redimensionar o DADO, mantendo a rotação atual e tudo ok! 0.8 usei aqui ok!
function resizeCard2(action) {
    if (!currentElement) return;

    let scale = parseFloat(currentElement.getAttribute('data-scale')) || 1;

    if (action === 'increase' && scale <8) {
        scale += 0.1; 
    } else if (action === 'decrease' && scale > 0.1) {
        scale -= 0.1; 
    }

    let rotation = parseInt(currentElement.getAttribute('data-rotation')) || 0;

    currentElement.style.transform = `rotate(${rotation}deg) scale(${scale+0.8})`;

    currentElement.setAttribute('data-scale', scale);

    // fecha janela popup de opcoes automaticamente
    //closeCardOptions();
}



//funcao para fechar popup do dado
function closeCardOptions2() {
        const cardOptions = document.getElementById('card-options2');
        cardOptions.classList.remove('show');
    }


// Função rotacionar para o dado já fazendo o ajuste de   currentElement.style.transform = `rotate(${rotation}deg) scale(${scale+0.8})`; ..... provavel ter que ajustar isso em outras mesas para evitar conflito ao rotacionar
function rotateCard2() {
    if (currentElement) {
        let rotation = parseInt(currentElement.getAttribute('data-rotation')) || 0;
        rotation += 45; // Aumenta a rotação em 45 graus sem limite

        let scale = parseFloat(currentElement.getAttribute('data-scale')) || 1;

        // Aplica a rotação e a escala
        currentElement.style.transform = `rotate(${rotation}deg) scale(${scale+0.8})`;

        currentElement.setAttribute('data-rotation', rotation); // Armazena o novo valor de rotação
        
        //closeCardOptions(); // Fecha opções de carta (se houver)
    }
}



// --------------------------------------------------------------------------------------------------------//





// Funcao que abre mini popup de opcoes de REDINENSIONAR + e -
function openResizeOptions_cartas() {
    // Cria o popup para redimensionar usando o CSS compartilhado
    const resizePopup = document.createElement('div');
    resizePopup.classList.add('dice-face-popup'); // Reutiliza o estilo da mini popup

    const selectedCard = currentElement; // O elemento (carta) selecionado no momento

    // Botão para aumentar o tamanho
    const increaseButton = document.createElement('button');
    increaseButton.textContent = 'CARTA +';
    increaseButton.addEventListener('click', () => {
        resizeCard('increase', selectedCard); // Aumenta a carta
    });
    resizePopup.appendChild(increaseButton);

    // Botão para diminuir o tamanho
    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = 'CARTA -';
    decreaseButton.addEventListener('click', () => {
        resizeCard('decrease', selectedCard); // Diminui a carta
    });
    resizePopup.appendChild(decreaseButton);

    // Botão vermelho de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(resizePopup); // Fecha a mini popup
    });
    resizePopup.appendChild(closeButton);

    document.body.appendChild(resizePopup); // Adiciona o popup ao corpo do documento
}

function openGroupingOptions() {
    // Cria o popup para agrupamento usando o CSS compartilhado
    const groupingPopup = document.createElement('div');
    groupingPopup.classList.add('dice-face-popup'); // Reutiliza o estilo da mini popup

    // Função para fechar ambas as pop-ups
    const closeBothPopups = () => {
        document.body.removeChild(groupingPopup); // Fecha a mini popup
        closeCardOptions(); // Fecha a popup principal de opções de cartas
    };

    // Botão para Agrupar
    const groupButton = document.createElement('button');
    groupButton.textContent = 'AGRUPAR';
    groupButton.addEventListener('click', () => {
        moveDeck(); // Chama a função de agrupar
        closeBothPopups(); // Fecha ambas as pop-ups
    });
    groupingPopup.appendChild(groupButton);

    // Botão para Agrupar + Frente/Trás
    const groupFrontBackButton = document.createElement('button');
    groupFrontBackButton.textContent = 'AGRUPAR + Frente/Trás';
    groupFrontBackButton.addEventListener('click', () => {
        Agruparetrazerfrente(); // Chama a função de agrupamento
        closeBothPopups(); // Fecha ambas as pop-ups
    });
    groupingPopup.appendChild(groupFrontBackButton);

    // Botão para Agrupar +
    const groupIncreaseButton = document.createElement('button');
    groupIncreaseButton.textContent = 'AGRUPAR +';
    groupIncreaseButton.addEventListener('click', () => {
        zoomGroupSize('increase'); // Chama a função de aumentar agrupamento
        closeBothPopups(); // Fecha ambas as pop-ups
    });
    groupingPopup.appendChild(groupIncreaseButton);

    // Botão para Agrupar -
    const groupDecreaseButton = document.createElement('button');
    groupDecreaseButton.textContent = 'AGRUPAR -';
    groupDecreaseButton.addEventListener('click', () => {
        zoomGroupSize('decrease'); // Chama a função de diminuir agrupamento
        closeBothPopups(); // Fecha ambas as pop-ups
    });
    groupingPopup.appendChild(groupDecreaseButton);

    // Botão para Agrupar + Reembaralhar
    const groupReshuffleButton = document.createElement('button');
    groupReshuffleButton.textContent = 'AGRUPAR + REEMBARALHAR';
    groupReshuffleButton.addEventListener('click', () => {
        stackCards(); // Chama a função de agrupar e reembaralhar
        closeBothPopups(); // Fecha ambas as pop-ups
    });
    groupingPopup.appendChild(groupReshuffleButton);

    // Botão para Agrupar + Virar
    const groupFlipButton = document.createElement('button');
    groupFlipButton.textContent = 'AGRUPAR + VIRAR';
    groupFlipButton.addEventListener('click', () => {
        closeBothPopups(); // Fecha ambas as pop-ups
        groupAndFlipCards(); // Chama a função de agrupar e virar
        
    });
    groupingPopup.appendChild(groupFlipButton);

    // Botão vermelho de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', closeBothPopups); // Fecha ambas as pop-ups
    groupingPopup.appendChild(closeButton);

    document.body.appendChild(groupingPopup); // Adiciona o popup ao corpo do documento
}




















//---------------------------------------------------------------------------------------------------------


// Funcao que abre mini popup fe opcies com faces dos dados
function openDiceFaceOptions() {
    // Cria o popup para escolher as faces do dado usando o CSS compartilhado
    const dicePopup = document.createElement('div');
    dicePopup.classList.add('dice-face-popup'); // Reutiliza a classe de estilo compartilhada

    const selectedDie = currentElement; // O dado selecionado no momento

// Criação dos botões para cada face do dado
function createDiceButtons() {
    // Primeiro, limpamos o popup (caso tenha sido usado antes)
    if (dicePopup) {
        dicePopup.innerHTML = '';
    }

    for (let i = 1; i <= 6; i++) {
        const faceButton = document.createElement('button');
        faceButton.textContent = i; // Define o texto do botão como o número da face

        // Aplica cores diferentes para pares de faces opostas
        switch (i) {
            case 1:
            case 6:
                faceButton.style.backgroundColor = '#7a7a7a'; // Cinza escuro
                break;
            case 2:
            case 5:
                faceButton.style.backgroundColor = '#b0b0b0'; // Cinza médio
                break;
            case 3:
            case 4:
                faceButton.style.backgroundColor = '#dcdcdc'; // Cinza claro
                break;
        }

        // Evento de clique que atualiza o dado e remove o popup
        faceButton.addEventListener('click', () => {
            selectedDie.src = `deck${selectedDie.getAttribute('data-deck')}/card${i}.jpeg`;
            // Verifica se o popup ainda existe antes de removê-lo
            if (document.body.contains(dicePopup)) {
                document.body.removeChild(dicePopup); // Remove o popup após o clique
            }
        });

        dicePopup.appendChild(faceButton); // Adiciona o botão ao popup
    }

    // Criação da explicação visual com ícones e texto
    const explanation = document.createElement('div');
    explanation.style.marginTop = '15px';
    explanation.style.fontSize = '14px';
    explanation.style.color = '#333';

    // Ícones visuais que explicam as faces opostas
    explanation.innerHTML = `
        <span style="color: #7a7a7a;">&#9679;</span> 1 &#8596; 6 &nbsp;
        <span style="color: #b0b0b0;">&#9679;</span> 2 &#8596; 5 &nbsp;
        <span style="color: #dcdcdc;">&#9679;</span> 3 &#8596; 4
    `;

    dicePopup.appendChild(explanation); // Adiciona a explicação ao popup

    // Certifica-se de que o popup está anexado ao body
    document.body.appendChild(dicePopup);
}

// Chama a função para criar os botões do dado
createDiceButtons();


// Cria uma observação explicando o uso dos tons
const explanation = document.createElement('p');
explanation.textContent = 'Faces opostas do dado compartilham o mesmo tom de cinza!';
explanation.style.marginTop = '15px'; // Adiciona margem para espaçar do popup
explanation.style.color = '#333'; // Cor do texto

// Adiciona a observação ao popup
dicePopup.appendChild(explanation);



    // Botão vermelho de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(dicePopup); // Fecha o popup
    });
    dicePopup.appendChild(closeButton);

    document.body.appendChild(dicePopup); // Adiciona o popup ao corpo do documento
}



//Funcao que abre mini popup com opcoes de REDIMENSIONAR o dado
function openResizeOptions() {
    // Cria o popup para redimensionar usando a mesma classe de estilo
    const resizePopup = document.createElement('div');
    resizePopup.classList.add('dice-face-popup'); // Reutiliza a classe de estilo do popup original

    const selectedCard = currentElement; // O elemento (carta ou dado) selecionado no momento

    // Botão para aumentar o tamanho
    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.addEventListener('click', () => {
        resizeCard2('increase', selectedCard); // Chama a função para aumentar o tamanho
    });
    resizePopup.appendChild(increaseButton);

    // Botão para diminuir o tamanho
    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.addEventListener('click', () => {
        resizeCard2('decrease', selectedCard); // Chama a função para diminuir o tamanho
    });
    resizePopup.appendChild(decreaseButton);

    // Botão vermelho de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(resizePopup); // Fecha o popup
    });
    resizePopup.appendChild(closeButton);

    document.body.appendChild(resizePopup); // Adiciona o popup ao corpo do documento
}





// --------------------------------------------------------------------------------------------------------//




// Função para recolher uma carta selecionada de volta para o deck usando o botão no popup
// Função para recolher uma carta selecionada de volta para o deck usando o botão no popup
function returnCardToDeck() {
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

    const deckNumber = selectedCard.getAttribute('data-deck');
    const originalCardSrc = selectedCard.getAttribute('data-original-src');

    // Verificar se o deck existe
    if (!allDecks[deckNumber]) {
        alert(`Deck ${deckNumber} não encontrado!`);
        return;
    }

    // Remover a carta da mesa
    selectedCard.remove();

    // Verificar se a carta já existe no deck antes de adicioná-la
    if (!allDecks[deckNumber].includes(originalCardSrc)) {
        allDecks[deckNumber].push(originalCardSrc);
        alert(`Carta recolhida de volta para o Deck ${deckNumber}!`);
    } else {
        alert(`A carta já está no Deck ${deckNumber} e não será adicionada novamente.`);
    }

    // Opcional: Atualizar a interface para mostrar que a carta foi recolhida
    updateDeckDisplay(deckNumber);

    // Fechar o pop-up de opções
    closeCardOptions();
}










// --------------------------------------------------------------------------------------------------------//




// Função para AGRUPAR e retornar todas as cartas aos seus respectivos dechs
// Função para AGRUPAR e retornar todas as cartas aos seus respectivos decks
function groupAndReturnCardsToDecks() {
    // Seleciona todas as cartas não agrupadas na mesa
    const allCards = Array.from(document.querySelectorAll('.card:not(.dice)')); // Excluindo cubos e dados

    // Separa a carta selecionada como ponto de referência para o agrupamento
    if (!selectedCard) {
        alert("Nenhuma carta selecionada!");
        return;
    }

    const selectedCardRect = selectedCard.getBoundingClientRect();
    const captureMargin = selectedCardRect.height / 2.5;  // Definir a margem relativa para o agrupamento

    const cardsToReturn = [selectedCard];  // Começar com a carta selecionada

    // Iterar sobre todas as cartas e agrupar as que estão próximas da carta selecionada
    allCards.forEach(card => {
        if (card !== selectedCard) {
            const cardRect = card.getBoundingClientRect();

            const isCloseVertically = Math.abs(cardRect.top - selectedCardRect.top) <= captureMargin;
            const isCloseHorizontally = Math.abs(cardRect.left - selectedCardRect.left) <= captureMargin;

            if (isCloseVertically && isCloseHorizontally) {
                cardsToReturn.push(card);
            }
        }
    });

    // Agora que as cartas foram agrupadas, vamos retornar cada uma ao seu respectivo deck
    cardsToReturn.forEach(card => {
        const deckNumber = card.getAttribute('data-deck'); // Obtém o número do deck da carta
        const cardSrc = card.getAttribute('data-original-src'); // Obtém o caminho original da carta

        // Verifica se o deck existe antes de adicionar a carta
        if (allDecks[deckNumber]) {
            // Verificar se a carta já existe no deck antes de adicioná-la
            if (!allDecks[deckNumber].includes(cardSrc)) {
                allDecks[deckNumber].push(cardSrc); // Retorna a carta ao respectivo deck
            }
        }

        // Remove a carta da mesa
        card.remove();
    });

    alert("Todas as cartas agrupadas foram retornadas para seus decks!");
}

document.getElementById('groupReturnButton').addEventListener('click', groupAndReturnCardsToDecks);








//----------------------------------------------------------------------------





// Coloca os dados na mesa automaticamente depois da pagina carregada!
document.addEventListener('DOMContentLoaded', function() {
    // Adiciona um atraso de 2 segundos antes de chamar a função
    setTimeout(function() {
        loadAppropriateCode();
    }, 2000); // 2000 milissegundos = 2 segundos
});






// Função para carregar o código apropriado
function loadAppropriateCode() {
    
// Função para detectar se é um dispositivo móvel
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Função para carregar o código apropriado
function loadAppropriateCode() {
    if (isMobileDevice()) {
        // Carrega a versão do código para dispositivos móveis
        loadMobileCode();
    } else {
        // Carrega a versão do código para PCs
        loadDesktopCode();
    }
}

// Função para a versão móvel
function loadMobileCode() {
    console.log("Carregando código para dispositivos móveis...");
   
    // Variável para armazenar o dado selecionado
    let selectedDie = null;

    // Função para rolar o dado e mostrar a face correta
    function rollDie(cardImage, faces) {
        const randomIndex = Math.floor(Math.random() * faces.length);
        cardImage.src = faces[randomIndex]; // Atualiza a imagem do dado para uma face aleatória
        cardImage.classList.add('flip-animation'); // Animação opcional

        setTimeout(() => {
            cardImage.classList.remove('flip-animation');
        }, 1000);
    }

    // Função para abrir as opções da carta (ou dado)
    function openCardOptions(card) {
        const cardOptions = document.getElementById('card-options2');
        const isFixedOnTop = card.getAttribute('data-fixed-on-top') === 'true';

        cardOptions.classList.add('show');
        currentElement = card;

        // Configura opções no pop-up de acordo com o estado da carta
        if (isFixedOnTop) {
       //     document.getElementById('bring-to-front-option').style.display = 'none';
          //  document.getElementById('stack-option').style.display = 'none';
          //  document.getElementById('zoomGroupSize').style.display = 'none';
         //   document.getElementById('rotate-btn-option').style.display = 'none';
        } else {
         //   document.getElementById('bring-to-front-option').style.display = 'block';
          //  document.getElementById('stack-option').style.display = 'block';
          //  document.getElementById('zoomGroupSize').style.display = 'block';
          //  document.getElementById('rotate-btn-option').style.display = 'block';
        }
    }

    

   // Função para ocultar o botão de rolar e remover a seleção
function deselectCurrentDie() {
    if (selectedDie) {
        selectedDie.rollButton.style.display = 'none'; // Oculta o botão de rolar
        selectedDie = null; // Reseta o dado selecionado
        if (selectedCard) {
            selectedCard.classList.remove('selected'); // Remove o estilo de seleção
            selectedCard = null; // Reseta a seleção visual
        }
    }
}

    // Função para colocar múltiplos dados na mesa
    function placeMultipleDice(deckNumber, numberOfDice) {
        const tableArea = document.getElementById('table-area');
        let conjuntoNovoDados = novoConjunto++;
        
        for (let i = 0; i < numberOfDice; i++) {
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('card-container');
            cardContainer.style.position = 'absolute';
           cardContainer.classList.add('dice-element');   // Classe adicional para identificar o dado
            
            
      // Posicionar cada dado criado [cada conjunto sera o conjuntoNovoDados++] em uma posicao diferebre se desejado ... 
    if (i === 0 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${10}px`;
    } else if (i === 1 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${10}px`;
    } else if (i === 2 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${10}px`;
    } else if (i === 3 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 4 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 5 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${60}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 6 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 7 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 8 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${10}px`;
    }else if (conjuntoNovoDados ===  0) {
        // Posição padrão se o deck não estiver mapeado
     cardContainer.style.left = `${100}px`;
     cardContainer.style.top = `${10}px`;
    }

            
            //conjunto 2 de dados....outra cor
            if (i === 0 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${60}px`;
    } else if (i === 1 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${60}px`;
    } else if (i === 2 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${60}px`;
    } else if (i === 3 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 4 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 5 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 6 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 7 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 8 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${100}px`;
        cardContainer.style.top = `${60}px`;
    }else if (conjuntoNovoDados ===  1) {
       //  Posição padrão se o deck não estiver mapeado
        cardContainer.style.left = `${110}px`;
        cardContainer.style.top = `${60}px`;
    }



//conjunto 3 de dados....outra cor
            if (i === 0 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${110}px`;
    } else if (i === 1 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${110}px`;
    } else if (i === 2 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${110}px`;
    } else if (i === 3 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 4 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 5 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${60}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 6 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 7 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 8 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${110}px`;
    }else if (conjuntoNovoDados ===  2) {
       //  Posição padrão se o deck não estiver mapeado
        cardContainer.style.left = `${100}px`;
        cardContainer.style.top = `${110}px`;
    }


//conjunto 4 de dados....outra cor
            if (i === 0 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${160}px`;
    } else if (i === 1 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${160}px`;
    } else if (i === 2 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${160}px`;
    } else if (i === 3 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 4 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 5 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${60}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 6 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 7 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 8 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${160}px`;
    }else if (conjuntoNovoDados ===  3) {
       //  Posição padrão se o deck não estiver mapeado
        cardContainer.style.left = `${100}px`;
        cardContainer.style.top = `${160}px`;
    }





            
            cardContainer.style.zIndex = '1000';
            cardContainer.style.textAlign = 'center';


            const cardImage = document.createElement('img');
            cardImage.classList.add('card', 'dice');
            cardImage.setAttribute('data-deck', deckNumber);
            cardImage.setAttribute('data-flipped', 'true');
            cardImage.setAttribute('data-scale', '0.3'); // Define a escala inicial, ou seja O TAMANHO DO DADO NA MESA!




            const faces = [
                `deck${deckNumber}/card1.jpeg`,
                `deck${deckNumber}/card2.jpeg`,
                `deck${deckNumber}/card3.jpeg`,
                `deck${deckNumber}/card4.jpeg`,
                `deck${deckNumber}/card5.jpeg`,
                `deck${deckNumber}/card6.jpeg`,
            ];

            // Exibir uma face aleatória inicialmente
            rollDie(cardImage, faces);

            // Reduz o tamanho real do dado (hitbox) ajustando diretamente o width e height
            const scale = parseFloat(cardImage.getAttribute('data-scale')) || 1;
            const originalWidth = 150; // Largura original do dado
            const originalHeight = 150; // Altura original do dado

            // Aplica o tamanho escalado
            cardImage.style.width = `${originalWidth * scale}px`;
            cardImage.style.height = `${originalHeight * scale}px`;

            // Botão "ROLAR"
            const rollButton = document.createElement('button');
            const img = document.createElement('img');
            img.src = 'icone.jpeg';
            img.style.width = '30px';
            img.style.height = '30px';
            rollButton.appendChild(img);
            rollButton.classList.add('roll-button');
            rollButton.style.display = 'none'; // Inicialmente invisível
            rollButton.style.position = 'absolute';
            rollButton.style.left = '60px'; 
            rollButton.style.transform = 'translateX(-50%)';

            const updateButtonPosition = () => {
                const boundingRect = cardImage.getBoundingClientRect();
                rollButton.style.top = `${boundingRect.height + 10}px`; // Ajusta a posição do botão
            };

            cardImage.addEventListener('load', updateButtonPosition);
            window.addEventListener('resize', updateButtonPosition);
            updateButtonPosition();

            rollButton.addEventListener('click', (event) => {
                event.stopPropagation();
                rollDie(cardImage, faces);
            });

            cardContainer.addEventListener('dblclick', () => {
                openCardOptions(cardImage);
            });

            // Evento de clique no dado
cardImage.addEventListener('click', (event) => {
    event.stopPropagation(); // Previne que o clique seja capturado pelo document
    deselectCurrentDie(); // Oculta o botão do dado anterior, se houver
    selectedDie = { rollButton }; // Armazena o dado atual como selecionado
    selectedCard = cardContainer; // Armazena o dado visualmente
    selectedCard.classList.add('selected'); // Aplica a classe de seleção visual
    rollButton.style.display = 'block'; // Exibe o botão de rolar
    updateButtonPosition(); // Atualiza a posição do botão de rolar
});


// Evento de clique fora do dado para ocultar o botão de rolar
document.addEventListener('click', (event) => {
    if (selectedDie && !event.target.closest('.card-container')) {
        // Se o clique não foi em um dado (card-container), ocultar o botão
        deselectCurrentDie();
    }
});





            cardContainer.appendChild(cardImage);
            cardContainer.appendChild(rollButton);
            tableArea.appendChild(cardContainer);

            let startX, startY;
            let isDragging = false;

            function onDeckTouchMove(event) {
                if (!isDragging) return;
                const touch = event.touches[0];
                const deltaX = (touch.clientX - startX) / zoomLevel;
                const deltaY = (touch.clientY - startY) / zoomLevel;
                cardContainer.style.left = `${parseFloat(cardContainer.style.left) + deltaX}px`;
                cardContainer.style.top = `${parseFloat(cardContainer.style.top) + deltaY}px`;
                startX = touch.clientX;
                startY = touch.clientY;
            }

            function startMove(event) {
                event.stopPropagation();
                isDragging = true;
                const touch = event.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                document.addEventListener('touchmove', onDeckTouchMove);
                document.addEventListener('touchend', stopDeckMove);
            }

            function stopDeckMove() {
                isDragging = false;
                document.removeEventListener('touchmove', onDeckTouchMove);
                document.removeEventListener('touchend', stopDeckMove);
            }

            cardContainer.addEventListener('touchstart', startMove);
        }
    }


// Exemplo de chamada


//placeMultipleDice(33, 9); // Chame isso para adicionar dados AMARELO à mesa
placeMultipleDice(16, 1); // Chame isso para adicionar dados BRANCOS à mesa
placeMultipleDice(15, 12); // Chame isso para adicionar dados VERMELHOS à mesa
placeMultipleDice(30, 4); // Chame isso para adicionar dados PRETOS à mesa
//placeMultipleDice(31, 8); // Chame isso para adicionar dados VERDE à mesa
//placeMultipleDice(32, 2); // Chame isso para adicionar dados AZUIS à mesa
//placeMultipleDice(16, 2); // Chame isso para adicionar dados BRANCOS à mesa
}






// Função para a versão de desktop
function loadDesktopCode() {
    // Insira aqui o código específico para PCs
    console.log("Carregando código para PCs...");
    // Exemplo de chamada para a função de colocar dados no desktop
   // Variável para armazenar o dado selecionado
  // Variável para armazenar o dado selecionado
    let selectedDie = null;

    // Função para rolar o dado e mostrar a face correta
    function rollDie(cardImage, faces) {
        const randomIndex = Math.floor(Math.random() * faces.length);
        cardImage.src = faces[randomIndex]; // Atualiza a imagem do dado para uma face aleatória
        cardImage.classList.add('flip-animation'); // Animação opcional

        setTimeout(() => {
            cardImage.classList.remove('flip-animation');
        }, 1000);
    }

    // Função para abrir as opções da carta (ou dado)
    function openCardOptions(card) {
        const cardOptions = document.getElementById('card-options2');
        const isFixedOnTop = card.getAttribute('data-fixed-on-top') === 'true';

        cardOptions.classList.add('show');
        currentElement = card;

        // Configura opções no pop-up de acordo com o estado da carta
        if (isFixedOnTop) {
       //     document.getElementById('bring-to-front-option').style.display = 'none';
          //  document.getElementById('stack-option').style.display = 'none';
          //  document.getElementById('zoomGroupSize').style.display = 'none';
         //   document.getElementById('rotate-btn-option').style.display = 'none';
        } else {
         //   document.getElementById('bring-to-front-option').style.display = 'block';
          //  document.getElementById('stack-option').style.display = 'block';
          //  document.getElementById('zoomGroupSize').style.display = 'block';
          //  document.getElementById('rotate-btn-option').style.display = 'block';
        }
    }

    

    // Função para ocultar o botão de rolar e remover a seleção
function deselectCurrentDie() {
    if (selectedDie) {
        selectedDie.rollButton.style.display = 'none'; // Oculta o botão de rolar
        selectedDie = null; // Reseta o dado selecionado
        if (selectedCard) {
            selectedCard.classList.remove('selected'); // Remove o estilo de seleção
            selectedCard = null; // Reseta a seleção visual
        }
    }
}

     // Função para colocar múltiplos dados na mesa
    function placeMultipleDice(deckNumber, numberOfDice) {
        const tableArea = document.getElementById('table-area');
        let conjuntoNovoDados = novoConjunto++;
        
        for (let i = 0; i < numberOfDice; i++) {
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('card-container');
        cardContainer.classList.add('dice-element');   // Classe adicional para identificar o dado

            cardContainer.style.position = 'absolute';
            
            
            
               // Posicionar cada dado criado [cada conjunto sera o conjuntoNovoDados++] em uma posicao diferebre se desejado ... 
    if (i === 0 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${10}px`;
    } else if (i === 1 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${10}px`;
    } else if (i === 2 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${10}px`;
    } else if (i === 3 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 4 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 5 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${60}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 6 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 7 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${10}px`;
    }else if (i === 8 && conjuntoNovoDados === 0) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${10}px`;
    }else if (conjuntoNovoDados ===  0) {
        // Posição padrão se o deck não estiver mapeado
     cardContainer.style.left = `${100}px`;
     cardContainer.style.top = `${10}px`;
    }

            
            //conjunto 2 de dados....outra cor
            if (i === 0 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${60}px`;
    } else if (i === 1 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${60}px`;
    } else if (i === 2 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${60}px`;
    } else if (i === 3 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 4 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 5 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 6 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 7 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${60}px`;
    }else if (i === 8 && conjuntoNovoDados === 1) {
        cardContainer.style.left = `${100}px`;
        cardContainer.style.top = `${60}px`;
    }else if (conjuntoNovoDados ===  1) {
       //  Posição padrão se o deck não estiver mapeado
        cardContainer.style.left = `${110}px`;
        cardContainer.style.top = `${60}px`;
    }



//conjunto 3 de dados....outra cor
            if (i === 0 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${110}px`;
    } else if (i === 1 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${110}px`;
    } else if (i === 2 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${110}px`;
    } else if (i === 3 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 4 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 5 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${60}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 6 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 7 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${110}px`;
    }else if (i === 8 && conjuntoNovoDados === 2) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${110}px`;
    }else if (conjuntoNovoDados ===  2) {
       //  Posição padrão se o deck não estiver mapeado
        cardContainer.style.left = `${100}px`;
        cardContainer.style.top = `${110}px`;
    }


//conjunto 4 de dados....outra cor
            if (i === 0 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${10}px`;
            cardContainer.style.top = `${160}px`;
    } else if (i === 1 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${20}px`;
            cardContainer.style.top = `${160}px`;
    } else if (i === 2 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${30}px`;
            cardContainer.style.top = `${160}px`;
    } else if (i === 3 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${40}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 4 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${50}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 5 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${60}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 6 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${70}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 7 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${80}px`;
        cardContainer.style.top = `${160}px`;
    }else if (i === 8 && conjuntoNovoDados === 3) {
        cardContainer.style.left = `${90}px`;
        cardContainer.style.top = `${160}px`;
    }else if (conjuntoNovoDados ===  3) {
       //  Posição padrão se o deck não estiver mapeado
        cardContainer.style.left = `${100}px`;
        cardContainer.style.top = `${160}px`;
    }





const diceIndex = '99999999999999999999999999999999';
            
            cardContainer.style.zIndex = diceIndex;
            cardContainer.style.textAlign = 'center';


            const cardImage = document.createElement('img');
            cardImage.classList.add('card', 'dice');
            cardImage.setAttribute('data-deck', deckNumber);
            cardImage.setAttribute('data-flipped', 'true');
            cardImage.setAttribute('data-scale', '0.3'); // Define a escala inicial, ou seja O TAMANHO DO DADO NA MESA!
            cardImage.style.zIndex = diceIndex;


    
            const faces = [
                `deck${deckNumber}/card1.jpeg`,
                `deck${deckNumber}/card2.jpeg`,
                `deck${deckNumber}/card3.jpeg`,
                `deck${deckNumber}/card4.jpeg`,
                `deck${deckNumber}/card5.jpeg`,
                `deck${deckNumber}/card6.jpeg`,
            ];

            // Exibir uma face aleatória inicialmente
            rollDie(cardImage, faces);

            // Reduz o tamanho real do dado (hitbox) ajustando diretamente o width e height
            const scale = parseFloat(cardImage.getAttribute('data-scale')) || 1;
            const originalWidth = 150; // Largura original do dado
            const originalHeight = 150; // Altura original do dado

            // Aplica o tamanho escalado
            cardImage.style.width = `${originalWidth * scale}px`;
            cardImage.style.height = `${originalHeight * scale}px`;

            // Botão "ROLAR"
            const rollButton = document.createElement('button');
            const img = document.createElement('img');
            img.src = 'icone.jpeg';
            img.style.width = '30px';
            img.style.height = '30px';
            rollButton.appendChild(img);
            rollButton.classList.add('roll-button');
            rollButton.style.display = 'none'; // Inicialmente invisível
            rollButton.style.position = 'absolute';
            rollButton.style.left = '60px'; 
            rollButton.style.transform = 'translateX(-50%)';

            const updateButtonPosition = () => {
                const boundingRect = cardImage.getBoundingClientRect();
                rollButton.style.top = `${boundingRect.height + 10}px`; // Ajusta a posição do botão
            };

            cardImage.addEventListener('load', updateButtonPosition);
            window.addEventListener('resize', updateButtonPosition);
            updateButtonPosition();

            rollButton.addEventListener('click', (event) => {
                event.stopPropagation();
                rollDie(cardImage, faces);
            });

            cardContainer.addEventListener('dblclick', () => {
                openCardOptions(cardImage);
            });

           // Evento de clique no dado
cardImage.addEventListener('click', (event) => {
    event.stopPropagation(); // Previne que o clique seja capturado pelo document
    deselectCurrentDie(); // Oculta o botão do dado anterior, se houver
    selectedDie = { rollButton }; // Armazena o dado atual como selecionado
    selectedCard = cardContainer; // Armazena o dado visualmente
    selectedCard.classList.add('selected'); // Aplica a classe de seleção visual
    rollButton.style.display = 'block'; // Exibe o botão de rolar
    updateButtonPosition(); // Atualiza a posição do botão de rolar
});

// Evento de clique fora do dado para ocultar o botão de rolar
document.addEventListener('click', (event) => {
    if (selectedDie && !event.target.closest('.card-container')) {
        // Se o clique não foi em um dado (card-container), ocultar o botão
        deselectCurrentDie();
    }
});

            cardContainer.appendChild(cardImage);
            cardContainer.appendChild(rollButton);
            tableArea.appendChild(cardContainer);

            let startX, startY;
            let isDragging = false;

        // Função de movimento para as cartas (com mouse)
        function onDeckMove(event) {
            if (!isDragging) return; // Não faz nada se não estiver arrastando

          //  const deltaX = event.clientX - startX.x;
           // const deltaY = event.clientY - startY.y;
         
            const deltaX = (event.clientX - startX.x) / zoomLevel;
           const deltaY = (event.clientY - startY.y) / zoomLevel;


            // Cálculo das novas posições SEM limites
            const newLeft = parseFloat(cardContainer.style.left) + deltaX;
            const newTop = parseFloat(cardContainer.style.top) + deltaY;

            cardContainer.style.left = `${newLeft}px`;
            cardContainer.style.top = `${newTop}px`;



            // Atualiza as posições de início
            startX.x = event.clientX;
            startY.y = event.clientY;
        }

        // Iniciar o movimento com o mouse
        function startMove(event) {
            event.preventDefault(); // Evita o comportamento padrão do navegador
            event.stopPropagation(); // Previne que a mesa se mova ao arrastar o dado

            isDragging = true; // Inicia o arrasto

            // Captura a posição inicial
            startX = { x: event.clientX, y: event.clientY };
            startY = { x: event.clientY, y: event.clientY };

            // Adiciona eventos de movimento e de parar
            document.addEventListener('mousemove', onDeckMove);
            document.addEventListener('mouseup', stopDeckMove);
        }

        // Parar o movimento do dado
        function stopDeckMove() {
            isDragging = false; // Para o arrasto
            document.removeEventListener('mousemove', onDeckMove);
            document.removeEventListener('mouseup', stopDeckMove);
        }

        // Adiciona evento de arrastar para o mouse
        cardContainer.addEventListener('mousedown', startMove);
    }
}

// Exemplo de chamada


//placeMultipleDice(33, 9); // Chame isso para adicionar dados AMARELO à mesa
placeMultipleDice(16, 1); // Chame isso para adicionar dados BRANCOS à mesa
placeMultipleDice(15, 12); // Chame isso para adicionar dados VERMELHOS à mesa
placeMultipleDice(30, 4); // Chame isso para adicionar dados PRETOS à mesa
//placeMultipleDice(31, 8); // Chame isso para adicionar dados VERDE à mesa
//placeMultipleDice(32, 2); // Chame isso para adicionar dados AZUIS à mesa
//placeMultipleDice(16, 2); // Chame isso para adicionar dados BRANCOS à mesa
}

// Chama a função para carregar o código apropriado ao iniciar
loadAppropriateCode();


}










































//___________________________________________








