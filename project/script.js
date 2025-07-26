const dropButton = document.getElementById('drop-button');
const coinContainer = document.getElementById('coin-container');
const coinSound = document.getElementById('coin-sound');
const coinCountDisplay = document.getElementById('coin-count');

let coinCount = 0;

dropButton.addEventListener('click', () => {
  const coin = document.createElement('div');
  coin.classList.add('coin');

  // Posisi horizontal acak saat jatuh
  const randomLeft = Math.random() * 80 + 10;
  coin.style.left = `${randomLeft}%`;

  coinContainer.appendChild(coin);

  // Mainkan suara
  coinSound.currentTime = 0;
  coinSound.play();

  // Tambahkan nilai koin
  coinCount += 10000000;
  coinCountDisplay.textContent = coinCount.toLocaleString();

  // Setelah animasi, ubah posisi supaya bisa menumpuk
  setTimeout(() => {
    coin.style.animation = 'none';
    coin.style.position = 'relative';
    coin.style.left = 'auto';
    coin.style.top = 'auto';
    coin.style.marginTop = '-10px';
    coin.style.marginLeft = `${Math.random() * 40 - 20}px`;
  }, 800);
});
