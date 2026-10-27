import { ChampionIcon } from '@/components/atoms/ChampionIcon';
import { ItemBuild } from '@/components/atoms/ItemBuild';
import { MatchTeamTable } from '@/components/matches/MatchTeamTable';
import { formatGameDate, formatGameDuration } from '@/lib/formatters';
import { getParticipantItems } from '@/lib/ranking';
import type { MatchSummary } from '@/types/match';

interface MatchCardProps {
  match: MatchSummary;
  selectedPuuid: string;
  isExpanded: boolean;
  onToggle: (matchId: string) => void;
}

export function MatchCard({ match, selectedPuuid, isExpanded, onToggle }: MatchCardProps) {
  const allParticipants = match.teams
    ? [...match.teams[0].participants, ...match.teams[1].participants]
    : [];
  const playerPart =
    allParticipants.find((participant) => participant.puuid === selectedPuuid) || allParticipants[0];
  const isWin = match.playerWin;
  const cardBg = isWin ? '#16222b' : '#2c181b';
  const borderColor = isWin ? '#21374a' : '#4a2125';

  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: 160 }}>
          <div style={{ fontWeight: 'bold', color: isWin ? '#5383e8' : '#e74c3c', fontSize: '0.9rem' }}>
            {isWin ? 'Vitória' : 'Derrota'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#808088' }}>{formatGameDuration(match.gameDuration)}</div>
          <div style={{ fontSize: '0.7rem', color: '#a0a0a0', marginTop: 2 }}>
            {formatGameDate(match.gameCreation)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 180 }}>
          {playerPart && (
            <>
              <ChampionIcon
                championName={playerPart.championName}
                size={42}
                level={playerPart.champLevel}
              />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#808088', textTransform: 'uppercase' }}>
                  Ranqueada
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Solo/Duo</div>
              </div>
            </>
          )}
        </div>

        {playerPart && (
          <div style={{ textAlign: 'center', width: 120 }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
              {playerPart.kills} / <span style={{ color: '#e74c3c' }}>{playerPart.deaths}</span> /{' '}
              {playerPart.assists}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#808088' }}>{playerPart.kda}:1 AMA</div>
          </div>
        )}

        {playerPart && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: '0.75rem', color: '#808088', lineHeight: 1.3 }}>
              <div>CS {playerPart.totalMinionsKilled}</div>
              <div>P/Abate 41%</div>
            </div>
            <ItemBuild items={getParticipantItems(playerPart)} grid />
          </div>
        )}

        <button
          onClick={() => onToggle(match.matchId)}
          style={{
            backgroundColor: isWin ? '#21374a' : '#4a2125',
            border: 'none',
            color: '#fff',
            width: 28,
            height: 28,
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && match.teams && (
        <div style={{ borderTop: '1px solid #2c2d33', backgroundColor: '#14151a' }}>
          {match.teams.map((team, index) => (
            <MatchTeamTable
              key={team.teamId}
              team={team}
              selectedPuuid={selectedPuuid}
              showTopBorder={index > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
