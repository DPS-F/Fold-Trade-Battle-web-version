import { useEffect, useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { RectButton } from '../ui/RectButton';

const REPO_URL = 'https://github.com/DPS-F/Fold-Trade-Battle-web-version';

export function RatingOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);
  const [loading, setLoading] = useState(false);

  // Расчет очков
  const questScore = player.totalQuestsCompleted * 1;
  const businessScore = player.businessWins * 2;
  const battleScore = Math.floor(player.battleWins / 4) * 1;
  
  const normalEndings = player.endings.filter(e => e !== 'true_ending').length;
  const hasTrueEnding = player.endings.includes('true_ending');
  const endingScore = (normalEndings * 52) + (hasTrueEnding ? 67 : 0);

  const totalScore = questScore + businessScore + battleScore + endingScore;

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Берем последние 100 issues из репозитория
      const res = await fetch(`https://api.github.com/repos/DPS-F/Fold-Trade-Battle-web-version/issues?state=all&per_page=100`);
      const data = await res.json();
      
      const scores = data
        .filter((issue: any) => issue.title.startsWith('[SCORE]'))
        .map((issue: any) => {
          const match = issue.title.match(/\[SCORE\] (\d+) - (.*)/);
          if (match) {
            return { score: parseInt(match[1]), name: match[2] };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score);

      setLeaderboard(scores);
    } catch (e) {
      console.error('Не удалось загрузить рейтинг', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchLeaderboard();
  }, [open]);

  const handleSubmit = () => {
    const title = encodeURIComponent(`[SCORE] ${totalScore} - ${player.name}`);
    const body = encodeURIComponent(`Мой рейтинг в Fold, Trade & Battle:\n\n- Квесты: ${questScore}\n- Бизнес: ${businessScore}\n- Бои: ${battleScore}\n- Концовки: ${endingScore}\n\n**Итого: ${totalScore}**`);
    window.open(`${REPO_URL}/issues/new?title=${title}&body=${body}`, '_blank');
  };

  return (
    <Overlay open={open} title="Зал Славы" onClose={onClose} width={600}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 24, color: 'var(--burned)' }}>
          Ваш рейтинг: {totalScore} очков
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          Квесты: {questScore} | Бизнес: {businessScore} | Бои: {battleScore} | Концовки: {endingScore}
        </div>
        <RectButton onClick={handleSubmit} style={{ marginTop: 16, background: 'var(--gold)', color: 'var(--burned)', fontWeight: 'bold' }}>
          Выложить прогресс на GitHub
        </RectButton>
        <div style={{ fontSize: 10, opacity: 0.5, marginTop: 8 }}>
          *Откроется страница GitHub. Нажмите "Submit new issue", чтобы игра засчитала ваш рейтинг.
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--paper-edge)', borderRadius: 4, padding: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-typewriter)', marginTop: 0, textAlign: 'center' }}>Топ игроков</h3>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.6 }}>Загрузка...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.6 }}>Пока никто не выложил рейтинг. Будьте первым!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((entry, idx) => (
              <div key={idx} style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '8px 12px', 
                background: idx === 0 ? 'rgba(201, 162, 39, 0.2)' : 'rgba(0,0,0,0.05)',
                borderRadius: 4, fontWeight: idx === 0 ? 'bold' : 'normal'
              }}>
                <div>{idx + 1}. {entry.name}</div>
                <div style={{ color: 'var(--accent-blue)' }}>{entry.score} очков</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Overlay>
  );
}