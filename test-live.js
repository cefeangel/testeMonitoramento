const apiUrl = 'http://localhost:8752/api';

async function validateEndpoint(name, promise) {
  try {
    const res = await promise;
    const body = await res.json();
    if (res.ok) {
      console.log(`✅ ${name} - Sucesso`);
      return body;
    } else {
      console.error(`❌ ${name} - Falhou com status ${res.status}:`, body);
      return body;
    }
  } catch (error) {
    console.error(`❌ ${name} - Erro de rede/execução: ${error.message}`);
  }
}

async function runLiveTests() {
  console.log("🚀 Iniciando testes Live na porta 8752 contra o banco MySQL...\n");

  const ts = Date.now(); // Para evitar colisão em email UNIQUE
  const email = `admin_${ts}@teste.com`;

  // 1. Auth Register
  const registerBody = await validateEndpoint('Registrar Admin', fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Admin Teste Vivo',
      email: email,
      senha: 'password123'
    })
  }));

  // 2. Auth Login
  const loginBody = await validateEndpoint('Login Admin', fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      senha: 'password123'
    })
  }));
  
  if (!loginBody || !loginBody.data || !loginBody.data.accessToken) {
    console.error('Falha crítica: Token não recebido.');
    return;
  }
  const token = loginBody.data.accessToken;

  // 3. Criar Evento
  const eventoBody = await validateEndpoint('Criar Evento', fetch(`${apiUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      nome: 'Casamento Ao Vivo',
      descricao: 'Teste no banco real',
      data_hora: new Date(Date.now() + 86400000).toISOString(),
      capacidade_total: 100,
      max_dependentes_por_convidado: 3
    })
  }));
  
  const eventId = eventoBody?.data?.id;

  // 4. Testar Evento com capacidade negativa (deve falhar no router ou bd)
  await validateEndpoint('Validar Restrição Evento - Nome Vazio', fetch(`${apiUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      nome: '', 
      capacidade_total: -10 
    })
  }));

  if (!eventId) return;

  // 5. Listar Eventos
  await validateEndpoint('Listar Eventos do Admin', fetch(`${apiUrl}/events`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  }));

  // 6. Criar Schedule
  const scheduleBody = await validateEndpoint('Criar Schedule', fetch(`${apiUrl}/events/${eventId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      titulo: 'Boas-vindas Live',
      descricao: 'Chegada dos convidados',
      data_hora: new Date().toISOString()
    })
  }));

  const scheduleId = scheduleBody?.data?.id;

  // 7. Criar Guest
  const guestBody = await validateEndpoint('Criar Convidado', fetch(`${apiUrl}/events/${eventId}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      nome_completo: 'Convidado Principal',
      telefone: '+55 (11) 91234-5678'
    })
  }));
  const guestId = guestBody?.data?.id;

  if (guestId) {
    // 8. Criar Companion
    const companionBody = await validateEndpoint('Adicionar Acompanhante', fetch(`${apiUrl}/events/${eventId}/guests/${guestId}/companions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        nome_completo: 'Filho do Convidado'
      })
    }));

    // 9. Confirmar Presença
    await validateEndpoint('Confirmar Presença do Convidado', fetch(`${apiUrl}/events/${eventId}/guests/${guestId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        status: 'CONFIRMADO'
      })
    }));

    // 10. Listar Confirmações
    await validateEndpoint('Listar Todas as Confirmações', fetch(`${apiUrl}/events/${eventId}/confirmations/all`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }));
  }

  // 11. Gerar QRCode
  await validateEndpoint('Gerar QRCode do Evento', fetch(`${apiUrl}/events/${eventId}/qrcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      expires_at: new Date(Date.now() + 864000000).toISOString()
    })
  }));

  console.log("\n🎉 Testes finalizados. Verifique os logs acima para os resultados das requisições reais.\n");
  
  // Opcional: Para testar as FK Cascate, a exclusão do evento deveria apagar convidado/scheudle, mas deixaremos ele persistido para o usuário ver os dados na mão.
  console.log("Os dados foram persistidos no MySQL do servidor ativo para sua avaliação. Event Id: " + eventId);

  process.exit(0);
}

runLiveTests();
