import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { useBusinessStore } from '../../state/businessStore';
import { GOODS } from '../../data/goods';
import { RectButton } from '../ui/RectButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MarketOverlay({ open, onClose }: Props) {
  const players = useBusinessStore(s => s.players);
  const turnIndex = useBusinessStore(s => s.turnIndex);
  const lots = useBusinessStore(s => s.lots);
  const storage = useBusinessStore(s => s.storage);
  const buyLot = useBusinessStore(s => s.buyLot);
  const createLot = useBusinessStore(s => s.createLot);
  
  const currentPlayer = players[turnIndex];
  // Игрок, чей это инвентарь (для отображения при чужом ходе)
  const humanPlayer = players.find(p => !p.isBot) || players[0];
  const isPlayerTurn = !currentPlayer?.isBot;

  const [isSelling, setIsSelling] = useState(false);
  const [sellGood, setSellGood] = useState<string | null>(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);

  if (!humanPlayer) return null;
  
  // Роль доступна только в свой ход
  const role = isPlayerTurn ? (currentPlayer.role || 'buyer') : null;
  
  // Товары, которые можно выставить (только у человека)
  const availableGoods = Object.entries(humanPlayer.inventory).filter(
    ([_, amt]) => amt > 0
  );

  // Объединяем обычные лоты и склад для отображения
  const allAvailableLots = [...lots, ...storage];

  const handleBuy = (lotId: string) => {
    if (buyLot(lotId)) onClose();
  };

  const handleSell = () => {
    if (!sellGood) return;
    if (createLot(sellGood, sellAmount, sellPrice)) {
      setIsSelling(false);
      onClose();
    } else {
      alert('Недостаточно товара или неверная цена!');
    }
  };

  return (
    <Overlay
      open={open}
      title={`Рынок ${isPlayerTurn ? `(${role === 'buyer' ? 'Покупатель' : 'Продавец'})` : '(Наблюдение)'}`}
      onClose={onClose}
    >
      {isSelling ? (
        <div>
          <h4 style={{ fontFamily: 'var(--font-typewriter)' }}>Выставить на продажу</h4>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {availableGoods.map(([gId, amt]) => (
                <button
                  key={gId}
                  className="rect-btn"
                  style={{ background: sellGood === gId ? 'var(--gold)' : '' }}
                  onClick={() => {
                    setSellGood(gId);
                    setSellAmount(1);
                    setSellPrice(GOODS[gId].basePrice);
                  }}
                >
                  {GOODS[gId].name} ({amt})
                </button>
              ))}
            </div>

            {sellGood && (
              <div
                style={{
                  padding: 16,
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span>Количество (макс 5):</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      className="rect-btn"
                      onClick={() => setSellAmount(Math.max(1, sellAmount - 1))}
                    >
                      -
                    </button>
                    <span>{sellAmount}</span>
                    <button
                      className="rect-btn"
                      onClick={() =>
                        setSellAmount(
                          Math.min(5, humanPlayer.inventory[sellGood], sellAmount + 1)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span>Цена за лот:</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      className="rect-btn"
                      onClick={() =>
                        setSellPrice(
                          Math.max(
                            Math.floor(GOODS[sellGood].basePrice * 0.5 * sellAmount),
                            sellPrice - 10
                          )
                        )
                      }
                    >
                      -
                    </button>
                    <span>{sellPrice} 🪙</span>
                    <button
                      className="rect-btn"
                      onClick={() =>
                        setSellPrice(
                          Math.min(
                            Math.floor(GOODS[sellGood].basePrice * 1.5 * sellAmount),
                            sellPrice + 10
                          )
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <RectButton onClick={handleSell}>Выставить на продажу</RectButton>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button className="rect-btn" onClick={() => setIsSelling(false)}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <RectButton
              onClick={() => setIsSelling(true)}
              disabled={!isPlayerTurn || role !== 'seller' || availableGoods.length === 0}
            >
              Выставить на продажу
            </RectButton>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {allAvailableLots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
                Предложений пока нет. Склад появится после первого круга.
              </div>
            ) : (
              allAvailableLots.map(lot => {
                const isStorage = lot.sellerId === 'storage';
                return (
                  <div
                    key={lot.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid var(--paper-edge)',
                      borderRadius: 4,
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-typewriter)' }}>
                        {GOODS[lot.goodId].name} x{lot.amount}
                        {isStorage && <span style={{ fontSize: 10, color: 'gray', marginLeft: 8 }}>(Склад)</span>}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Продавец: {isStorage ? 'Склад бумажного мира' : players.find(p => p.id === lot.sellerId)?.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span
                        style={{ fontFamily: 'var(--font-typewriter)', fontSize: 18 }}
                      >
                        {lot.price} 🪙
                      </span>
                      <RectButton
                        disabled={
                          !isPlayerTurn ||
                          role !== 'buyer' ||
                          humanPlayer.scraps < lot.price ||
                          lot.sellerId === humanPlayer.id
                        }
                        onClick={() => handleBuy(lot.id)}
                      >
                        Купить
                      </RectButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </Overlay>
  );
}