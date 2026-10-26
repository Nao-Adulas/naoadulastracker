import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase do lado do Front-end
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProcessedPlayer {
  gameName: string;
  tagLine: string;
  riotId: string;
  puuid: string;
  profileIconId: number;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number | null;
  status: 'SUCCESS' | 'UNRANKED' | 'ERROR';
  errorMessage?: string;
  is_online?: boolean;
}

const TIER_ORDER: Record<string, number> = {
  CHALLENGER: 1, GRANDMASTER: 2, MASTER: 3, DIAMOND: 4,
  EMERALD: 5, PLATINUM: 6, GOLD: 7, SILVER: 8, BRONZE: 9, IRON: 10, UNRANKED: 11, UNAVAILABLE: 12,
};

const RANK_ORDER: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4 };

const getProfileIconUrl = (iconId: number) => {
  return `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${iconId}.png`;
};

const getTierIconUrl = (tier: string) => {
  if (!tier || tier === 'UNRANKED' || tier === 'UNAVAILABLE') {
    return '/images/Rank=Silver.png';
  }
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  return `/images/Rank=${formattedTier}.png`;
};

const formatGameDate = (timestamp: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Home() {
  const [players, setPlayers] = useState<ProcessedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [currentView, setCurrentView] = useState<'home' | 'playerDetail'>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<ProcessedPlayer | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // 1. Buscar dados DIRETAMENTE do Supabase ao carregar a página
  const fetchRankingFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*');

      if (error) {
        console.error('Erro ao buscar do Supabase:', error);
        setPlayers([]);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const formattedPlayers: ProcessedPlayer[] = data.map((p: any) => ({
          gameName: p.game_name,
          tagLine: p.tag_line,
          riotId: p.riot_id || `${p.game_name}#${p.tag_line}`,
          puuid: p.puuid,
          profileIconId: p.profile_icon_id || 29,
          tier: p.tier || 'UNRANKED',
          rank: p.rank || '',
          leaguePoints: p.league_points || 0,
          wins: p.wins || 0,
          losses: p.losses || 0,
          winRate: p.win_rate !== null ? Number(p.win_rate) : null,
          status: p.tier && p.tier !== 'UNRANKED' ? 'SUCCESS' : 'UNRANKED',
          is_online: p.is_online
        }));

        formattedPlayers.sort((a, b) => {
          const tierA = TIER_ORDER[a.tier] || 99;
          const tierB = TIER_ORDER[b.tier] || 99;
          if (tierA !== tierB) return tierA - tierB;
          const rankA = RANK_ORDER[a.rank] || 99;
          const rankB = RANK_ORDER[b.rank] || 99;
          if (rankA !== rankB) return rankA - rankB;
          return (b.leaguePoints || 0) - (a.leaguePoints || 0);
        });

        setPlayers(formattedPlayers);
        setLastUpdated(new Date());
      } else {
        setPlayers([]);
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankingFromSupabase();
  }, [fetchRankingFromSupabase]);

  // 2. Botão de Atualizar: Dispara a API para buscar na Riot, atualizar o Supabase e atualizar a tela com loading ativo
  const handleUpdateRanking = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/update-ranking', { method: 'POST' });
      const result = await res.json();

      if (res.ok) {
        await fetchRankingFromSupabase();
      } else {
        alert('Erro ao atualizar o ranking: ' + (result.error || 'Erro desconhecido'));
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erro de rede ao atualizar:', err);
      alert('Erro de rede ao atualizar ranking.');
      setIsLoading(false);
    }
  };

  const handleSelectPlayer = async (player: ProcessedPlayer) => {
    if (!player.puuid) return;
    setSelectedPlayer(player);
    setCurrentView('playerDetail');
    setIsLoadingMatches(true);
    setExpandedMatchId(null);

    try {
      const res = await fetch(`/api/matches?puuid=${player.puuid}&region=americas`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Erro ao buscar partidas:', err);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  const topGrinder = players.length > 0
    ? [...players].sort((a, b) => ((b.wins || 0) + (b.losses || 0)) - ((a.wins || 0) + (a.losses || 0)))[0]
    : null;

  const grinderTotalGames = topGrinder ? (topGrinder.wins || 0) + (topGrinder.losses || 0) : 0;
  const grinderEstimatedHours = Math.round((grinderTotalGames * 28) / 60);

  return (
    <div style={{ backgroundColor: '#0b0914', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background-color: #0b0914 !important;
          color: #e2e8f0;
          margin: 0;
        }
        .halloween-pumpkin {
          display: inline-block;
          margin-left: 6px;
          filter: drop-shadow(0 0 8px rgba(255, 107, 0, 0.8));
          animation: pulse-pumpkin 2s infinite ease-in-out;
        }
        @keyframes pulse-pumpkin {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(255, 107, 0, 0.6)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 14px rgba(255, 120, 0, 1)); }
        }
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 150px;
          height: 150px;
          pointer-events: none;
          background-image: radial-gradient(circle at top left, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 15px 15px;
          z-index: 999;
          opacity: 0.6;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

      {/* Header */}
      <header style={{ backgroundColor: '#1f2026', borderBottom: '1px solid #2c2d33', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          onClick={() => setCurrentView('home')} 
          style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#5383e8', letterSpacing: '-0.5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          NaoAdulas.gg <span className="halloween-pumpkin">🎃</span>
        </div>
        {currentView === 'home' && (
          <button
            onClick={handleUpdateRanking}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#2c2d33' : '#5383e8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Atualizando...' : 'Atualizar Ranking'}
          </button>
        )}
      </header>

      {/* TELA 1: RANKING */}
      {currentView === 'home' && (
        <main style={{ maxWidth: '1150px', margin: '32px auto', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* PAINEL LATERAL ESQUERDO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <aside style={{ backgroundColor: '#1f2026', borderRadius: '12px', border: '1px solid #2c2d33', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>⏳</span>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#3498db' }}>Mais Partidas na Season</h3>
                </div>

                {topGrinder && topGrinder.status === 'SUCCESS' ? (
                  <div 
                    onClick={() => handleSelectPlayer(topGrinder)}
                    style={{
                      backgroundColor: '#18191e',
                      border: '1px solid #2c2d33',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3498db';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2c2d33';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                      <img 
                        src={getProfileIconUrl(topGrinder.profileIconId)} 
                        alt="Perfil" 
                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #3498db', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#5383e8', fontWeight: 'bold' }}>
                      {topGrinder.riotId}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#1f2026', borderRadius: '6px', padding: '10px 8px', border: '1px solid #2c2d33', marginTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#808088', textTransform: 'uppercase' }}>Total de Partidas</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff' }}>{grinderTotalGames} jogos</div>
                      </div>
                      <div style={{ borderLeft: '1px solid #2c2d33' }} />
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#808088', textTransform: 'uppercase' }}>Tempo Estimado</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#3498db' }}>~{grinderEstimatedHours} hrs</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textTransform: 'capitalize', color: '#808088', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                    {isLoading ? 'Calculando...' : 'Sem dados suficientes'}
                  </div>
                )}
              </aside>
            </div>

            {/* TABELA DE RANKING PRINCIPAL */}
            <div style={{ backgroundColor: '#1f2026', borderRadius: '12px', border: '1px solid #2c2d33', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #2c2d33', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Ranking da Galera</h2>
                {lastUpdated && <span style={{ fontSize: '0.8rem', color: '#808088' }}>Atualizado às {lastUpdated.toLocaleTimeString()}</span>}
              </div>

              <div style={{ overflowX: 'auto', minHeight: '250px', position: 'relative' }}>
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', border: '4px solid #2c2d33', borderTop: '4px solid #5383e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ color: '#808088', fontWeight: '500', fontSize: '0.9rem' }}>A atualizar dados na Riot e Supabase...</span>
                  </div>
                ) : players.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', textAlign: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '2.5rem' }}>📭</div>
                    <p style={{ fontSize: '1.1rem', color: '#d1d4dc', margin: 0, fontWeight: '600' }}>Sem dados disponíveis, atualize o ranking</p>
                    <button
                      onClick={handleUpdateRanking}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#2ecc71',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      Atualizar Agora
                    </button>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#18191e', color: '#808088', borderBottom: '1px solid #2c2d33', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '14px 16px', textAlign: 'center', width: '60px' }}>#</th>
                        <th style={{ padding: '14px 16px' }}>Invocador</th>
                        <th style={{ padding: '14px 16px' }}>Elo</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>PDL</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Vitórias / Derrotas</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((p, idx) => (
                        <tr 
                          key={p.puuid || p.riotId} 
                          onClick={() => handleSelectPlayer(p)}
                          style={{ borderBottom: '1px solid #2c2d33', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#25262c')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                            {idx === 0 ? (
                              <img src="/images/medals/gold.png" alt="1º Lugar" style={{ width: '40px', height: '40px', objectFit: 'contain', verticalAlign: 'middle' }} />
                            ) : idx === 1 ? (
                              <img src="/images/medals/silver.png" alt="2º Lugar" style={{ width: '40px', height: '40px', objectFit: 'contain', verticalAlign: 'middle' }} />
                            ) : idx === 2 ? (
                              <img src="/images/medals/bronze.png" alt="3º Lugar" style={{ width: '40px', height: '40px', objectFit: 'contain', verticalAlign: 'middle' }} />
                            ) : (
                              <span style={{ color: '#808088' }}>{idx + 1}</span>
                            )}
                          </td>
                          
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img 
                                src={getProfileIconUrl(p.profileIconId)} 
                                alt="Perfil" 
                                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #444', objectFit: 'cover' }}
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <img 
                                src={getTierIconUrl(p.tier)} 
                                alt={p.tier} 
                                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <span style={{ fontWeight: '600', color: '#5383e8' }}>
                                {p.riotId}
                              </span>
                              {p.is_online && (
                                <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  Em partida 🟢
                                </span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '16px' }}>
                            {p.status === 'ERROR' ? (
                              <span style={{ color: '#e74c3c' }}>Erro</span>
                            ) : p.status === 'UNRANKED' ? (
                              <span style={{ color: '#808088' }}>Unranked</span>
                            ) : (
                              <span style={{ fontWeight: '600', color: '#d1d4dc', textTransform: 'capitalize' }}>
                                {p.tier.toLowerCase()} {p.rank}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>{p.status === 'SUCCESS' ? `${p.leaguePoints} LP` : '—'}</td>
                          <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem' }}>
                            {p.status === 'SUCCESS' ? (
                              <span><strong style={{ color: '#2ecc71' }}>{p.wins}V</strong> <strong style={{ color: '#e74c3c' }}>{p.losses}D</strong></span>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: p.winRate && p.winRate >= 50 ? '#5383e8' : '#e74c3c' }}>
                            {p.winRate !== null ? `${p.winRate}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* TELA 2: HISTÓRICO DE PARTIDAS */}
      {currentView === 'playerDetail' && selectedPlayer && (
        <main style={{ maxWidth: '950px', margin: '32px auto', padding: '0 16px' }}>
          <button 
            onClick={() => setCurrentView('home')}
            style={{ marginBottom: '16px', padding: '8px 16px', backgroundColor: '#1f2026', color: '#5383e8', border: '1px solid #2c2d33', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            ← Voltar ao Ranking
          </button>

          <div style={{ backgroundColor: '#1f2026', borderRadius: '12px', border: '1px solid #2c2d33', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={getProfileIconUrl(selectedPlayer.profileIconId)} 
                alt="Perfil" 
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #5383e8', objectFit: 'cover' }} 
              />
              <img 
                src={getTierIconUrl(selectedPlayer.tier)} 
                alt="Elo" 
                style={{ position: 'absolute', bottom: '-8px', right: '-12px', width: '42px', height: '42px', objectFit: 'contain' }} 
              />
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: '#fff' }}>{selectedPlayer.riotId}</h1>
              <p style={{ margin: 0, color: '#808088', fontSize: '0.95rem', textTransform: 'capitalize' }}>
                {selectedPlayer.tier !== 'UNRANKED' ? `${selectedPlayer.tier} ${selectedPlayer.rank} — ${selectedPlayer.leaguePoints} LP` : 'Unranked'}
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#d1d4dc' }}>Histórico de Partidas</h3>

          {isLoadingMatches ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#808088' }}>Carregando histórico detalhado da Riot API...</div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#808088' }}>Nenhuma partida encontrada.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map((match: any) => {
                const isWin = match.playerWin;
                const isExpanded = expandedMatchId === match.matchId;

                const allParticipants = match.teams ? [...match.teams[0].participants, ...match.teams[1].participants] : [];
                const playerPart = allParticipants.find((p: any) => p.puuid === selectedPlayer.puuid) || allParticipants[0];

                const cardBg = isWin ? '#16222b' : '#2c181b';
                const borderColor = isWin ? '#21374a' : '#4a2125';

                return (
                  <div 
                    key={match.matchId}
                    style={{
                      backgroundColor: cardBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: '160px' }}>
                        <div style={{ fontWeight: 'bold', color: isWin ? '#5383e8' : '#e74c3c', fontSize: '0.9rem' }}>
                          {isWin ? 'Vitória' : 'Derrota'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#808088' }}>
                          {Math.floor(match.gameDuration / 60)} min
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#a0a0a0', marginTop: '2px' }}>
                          {formatGameDate(match.gameCreation)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '180px' }}>
                        {playerPart && (
                          <>
                            <div style={{ position: 'relative' }}>
                              <img 
                                src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${playerPart.championName}.png`} 
                                alt="Campeão" 
                                style={{ width: '42px', height: '42px', borderRadius: '50%' }} 
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: '#111', color: '#fff', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '50%', border: '1px solid #444' }}>
                                {playerPart.champLevel}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#808088', textTransform: 'uppercase' }}>Ranqueada</div>
                              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Solo/Duo</div>
                            </div>
                          </>
                        )}
                      </div>

                      {playerPart && (
                        <div style={{ textAlign: 'center', width: '120px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {playerPart.kills} / <span style={{ color: '#e74c3c' }}>{playerPart.deaths}</span> / {playerPart.assists}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#808088' }}>
                            {playerPart.kda}:1 AMA
                          </div>
                        </div>
                      )}

                      {playerPart && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#808088', lineHeight: '1.3' }}>
                            <div>CS {playerPart.totalMinionsKilled}</div>
                            <div>P/Abate 41%</div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 20px)', gap: '2px' }}>
                            {[playerPart.item0, playerPart.item1, playerPart.item2, playerPart.item3, playerPart.item4, playerPart.item5, playerPart.item6].map((itemId, i) => (
                              itemId && itemId > 0 ? (
                                <img 
                                  key={i} 
                                  src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${itemId}.png`} 
                                  alt="item" 
                                  style={{ width: '20px', height: '20px', borderRadius: '3px', backgroundColor: '#111' }} 
                                />
                              ) : (
                                <div key={i} style={{ width: '20px', height: '20px', borderRadius: '3px', backgroundColor: '#18191e' }} />
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => toggleExpand(match.matchId)}
                        style={{
                          backgroundColor: isWin ? '#21374a' : '#4a2125',
                          border: 'none',
                          color: '#fff',
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          transition: 'transform 0.2s'
                        }}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>

                    </div>

                    {isExpanded && match.teams && (
                      <div style={{ borderTop: '1px solid #2c2d33', backgroundColor: '#14151a' }}>
                        {match.teams.map((team: any, tIdx: number) => {
                          const isBlueTeam = team.teamId === 100;
                          const teamBg = isBlueTeam ? 'rgba(33, 55, 74, 0.3)' : 'rgba(74, 33, 37, 0.3)';
                          const teamTitleColor = isBlueTeam ? '#5383e8' : '#e74c3c';

                          return (
                            <div key={tIdx} style={{ borderTop: tIdx > 0 ? '1px solid #2c2d33' : 'none' }}>
                              <div style={{ backgroundColor: teamBg, padding: '6px 16px', fontSize: '0.75rem', fontWeight: 'bold', color: teamTitleColor, display: 'flex', justifyContent: 'space-between' }}>
                                <span>{isBlueTeam ? 'Equipe Azul' : 'Equipe Vermelha'} ({team.win ? 'Vitória' : 'Derrota'})</span>
                              </div>

                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                  <thead>
                                    <tr style={{ color: '#808088', borderBottom: '1px solid #2c2d33', fontSize: '0.7rem' }}>
                                      <th style={{ padding: '6px 12px', textAlign: 'left' }}>Invocador</th>
                                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>KDA</th>
                                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Dano</th>
                                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Wards</th>
                                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>CS</th>
                                      <th style={{ padding: '6px 12px', textAlign: 'left' }}>Itens</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {team.participants.map((p: any, pIdx: number) => (
                                      <tr key={pIdx} style={{ borderBottom: '1px solid #2c2d33' }}>
                                        <td style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <img 
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${p.championName}.png`} 
                                            alt={p.championName} 
                                            style={{ width: '24px', height: '24px', borderRadius: '50%' }} 
                                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                          />
                                          <span style={{ fontWeight: '600', color: p.puuid === selectedPlayer.puuid ? '#f39c12' : '#fff', whiteSpace: 'nowrap' }}>
                                            {p.riotId || p.summonerName}
                                          </span>
                                        </td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                          <span>{p.kills}/<span style={{ color: '#e74c3c' }}>{p.deaths}</span>/{p.assists}</span>
                                          <div style={{ fontSize: '0.65rem', color: '#808088' }}>{p.kda}:1</div>
                                        </td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#d1d4dc', whiteSpace: 'nowrap' }}>
                                          {p.totalDamageDealtToChampions.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#808088' }}>
                                          {p.wardsPlaced}
                                        </td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#d1d4dc' }}>
                                          {p.totalMinionsKilled}
                                        </td>
                                        <td style={{ padding: '6px 12px' }}>
                                          <div style={{ display: 'flex', gap: '2px' }}>
                                            {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map((itemId, i) => (
                                              itemId && itemId > 0 ? (
                                                <img 
                                                  key={i} 
                                                  src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${itemId}.png`} 
                                                  alt="item" 
                                                  style={{ width: '20px', height: '20px', borderRadius: '3px', backgroundColor: '#111' }} 
                                                />
                                              ) : (
                                                <div key={i} style={{ width: '20px', height: '20px', borderRadius: '3px', backgroundColor: '#18191e' }} />
                                              )
                                            ))}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
}