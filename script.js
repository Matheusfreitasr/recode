// Configuração do mapa Leaflet
const map = L.map('map').setView([-29.68, -53.8], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

const markers = L.markerClusterGroup();

// Função para adicionar o marcador no mapa
function adicionarMarcador(coordenadas, descricao, tipo, nomeLocalizacao) {
    let iconUrl = '';

    // Define o ícone com base no tipo de relato
    switch (tipo) {
        case 'desaparecido':
            iconUrl = 'icons/desaparecido.png';
            break;
        case 'abrigo':
            iconUrl = 'icons/abrigo.png';
            break;
        case 'emergencia':
            iconUrl = 'icons/emergencia.png';
            break;
    }

    const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const marker = L.marker(coordenadas, { icon: icon })
        .bindPopup(`<strong>Descrição:</strong> ${descricao}<br><strong>Tipo:</strong> ${tipo}`);

    markers.addLayer(marker);

    // Adiciona o relato na lista de relatos recentes
    const relatoDiv = document.createElement('div');
    relatoDiv.className = 'relato';
    relatoDiv.innerHTML = `<strong>Local:</strong> ${nomeLocalizacao}<br><strong>Descrição:</strong> ${descricao}<br><strong>Tipo:</strong> ${tipo}`;
    document.getElementById('listaRelatos').appendChild(relatoDiv);

    map.addLayer(markers);
}

// Função para buscar coordenadas usando a API Nominatim
async function buscarCoordenadas(localizacao) {
    const resposta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localizacao)}&addressdetails=1`);
    const dados = await resposta.json();
    return dados.length > 0 ? dados : alert("Localização não encontrada. Tente novamente.");
}

// Função para mostrar resultados da busca de localização e permitir escolha
function mostrarResultados(dados, descricao, tipo) {
    const listaResultados = document.createElement('div');
    listaResultados.id = 'resultados';
    listaResultados.style.border = '1px solid #ccc';
    listaResultados.style.marginTop = '1rem';
    listaResultados.style.padding = '1rem';
    
    dados.forEach((resultado) => {
        const divResultado = document.createElement('div');
        divResultado.innerHTML = `<strong>${resultado.display_name}</strong> <button onclick="adicionarMarcadorNaSelecao([${resultado.lat}, ${resultado.lon}], '${descricao}', '${tipo}', '${resultado.display_name}')">Adicionar</button>`;
        listaResultados.appendChild(divResultado);
    });

    document.getElementById('relatos').appendChild(listaResultados);
}

// Função para adicionar marcador ao mapa com nome de localização
function adicionarMarcadorNaSelecao(coordenadas, descricao, tipo, nomeLocalizacao) {
    adicionarMarcador(coordenadas, descricao, tipo, nomeLocalizacao);
    document.getElementById('resultados').remove();  // Remove os resultados de localização após a seleção
}

// Evento para o envio do formulário de relatos
document.getElementById('relatoForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const localizacao = document.getElementById('localizacao').value;
    const descricao = document.getElementById('descricao').value;
    const tipo = document.getElementById('tipoRelato').value;

    // Busca coordenadas e exibe resultados de seleção
    const coordenadas = await buscarCoordenadas(localizacao);
    if (coordenadas) {
        mostrarResultados(coordenadas, descricao, tipo);
    }
});
