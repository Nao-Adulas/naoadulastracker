import { ChampionIcon } from '@/components/atoms/ChampionIcon';
import { ItemBuild } from '@/components/atoms/ItemBuild';
import { getParticipantItems } from '@/lib/ranking';
import type { MatchTeam } from '@/types/match';

interface MatchTeamTableProps {
  team: MatchTeam;
  selectedPuuid: string;
  showTopBorder: boolean;
}

export function MatchTeamTable({ team, selectedPuuid, showTopBorder }: MatchTeamTableProps) {
  const isBlueTeam = team.teamId === 100;
  const teamBg = isBlueTeam ? 'rgba(33, 55, 74, 0.3)' : 'rgba(74, 33, 37, 0.3)';
  const teamTitleColor = isBlueTeam ? '#5383e8' : '#e74c3c';

  return (
    <div style={{ borderTop: showTopBorder ? '1px solid #2c2d33' : 'none' }}>
      <div
        style={{
          backgroundColor: teamBg,
          padding: '6px 16px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: teamTitleColor,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {isBlueTeam ? 'Equipe Azul' : 'Equipe Vermelha'} ({team.win ? 'Vitória' : 'Derrota'})
        </span>
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
            {team.participants.map((participant, index) => (
              <tr key={`${participant.puuid}-${index}`} style={{ borderBottom: '1px solid #2c2d33' }}>
                <td style={{ padding: '6px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChampionIcon championName={participant.championName} size={24} />
                    <span
                      style={{
                        fontWeight: 600,
                        color: participant.puuid === selectedPuuid ? '#f39c12' : '#fff',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {participant.riotId || participant.summonerName}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <span>
                    {participant.kills}/<span style={{ color: '#e74c3c' }}>{participant.deaths}</span>/
                    {participant.assists}
                  </span>
                  <div style={{ fontSize: '0.65rem', color: '#808088' }}>{participant.kda}:1</div>
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#d1d4dc', whiteSpace: 'nowrap' }}>
                  {participant.totalDamageDealtToChampions.toLocaleString()}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#808088' }}>
                  {participant.wardsPlaced}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#d1d4dc' }}>
                  {participant.totalMinionsKilled}
                </td>
                <td style={{ padding: '6px 12px' }}>
                  <ItemBuild items={getParticipantItems(participant)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
