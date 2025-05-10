const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbw0T26DPyiSfi3OlzjcLugVGbsFM-OcoOyG24KzGRQpOZl_wrhWnzNA_tdr0wTMISmtKw/exec';

let tableData = [];
let currentRowIndex = 0;
let clickCount = 0;
let isSlideshowMode = false;
let currentPageIndex = 0; // 新的頁面索引，控制 A → B → C → D → E
let currentWheelRotation = 0; // 記錄轉盤當前的旋轉角度

const leftToRightImages = [
  'reikal1.png',
  'ham_ham_hyper.gif',
  'Hamtaro.gif',
  'HamDanceTransparent.gif',
  'boinboin.png'
];
const rightToLeftImages = [
  'reikar1.png',
  'ham_ham_hyper.gif',
  'Hamtaro.gif',
  'HamDanceTransparent.gif',
  'boinboin.png'
];

// 投影片圖片路徑
const slideshowImages = [
  'kazuma.png',      // 第一張投影片 (A)
  'ray_reika1.png',  // 第二張投影片 (C)
  'happy_mon_day.png'   // 第三張投影片 (E)
];

// 頁面順序：A → B → C → D → E
const pages = [
  'slideshow1', // A: 投影片1
  'wheel',      // B: 轉盤
  'slideshow2', // C: 投影片2
  'lottery',    // D: 抽獎
  'slideshow3'  // E: 投影片3
];

const probabilities = [24.75, 24.75, 24.75, 24.75, 1];

const animationStyles = [
  'diagonal-top-right-to-bottom-left',
  'diagonal-bottom-left-to-top-right',
  'diagonal-top-left-to-bottom-right',
  'diagonal-bottom-right-to-top-left',
  'move-top-to-bottom',
  'move-bottom-to-top',
  'move-left-to-right',
  'move-right-to-left'
];

// 定義 6 個區段的文字、角度、垂直位置和水平位置
const wheelOptions = [
  { text: '', angle: -60, top: '20%', left: '55%' }, // 第一格：0° 到 60°
  { text: '', angle: -60, top: '20%', left: '55%' }, // 第二格：60° 到 120°
  { text: '', angle: -60, top: '20%', left: '55%' }, // 第三格：120° 到 180°
  { text: '', angle: -60, top: '20%', left: '55%' }, // 第四格：180° 到 240°
  { text: '', angle: -60, top: '20%', left: '55%' }, // 第五格：240° 到 300°
  { text: 'ご褒美', angle: -60, top: '20%', left: '60%' }  // 第六格：300° 到 360°
];

// 轉盤結果的自訂文字，與 wheelOptions 對應
const wheelMessages = [
  '残念！！ｶﾞ━━(ﾟДﾟ;)━━━ﾝ!!', // 第一格
  'はーい！！ハズレー！！(ﾟДﾟ;)', // 第二格
  'ヾ(*￣▽￣*)また今度ー', // 第三格
  '運がない、残念ー', // 第四格
  'ギリギリアウト！！', // 第五格
  '大当たり！！' // 第六格
];

// 抽獎活動的圖片
const lotteryImages = [
  'brownie1.jpg',
  'brownie2.jpg',
  'brownie3.jpg',
  'brownie4.jpg'
];

// 抽獎結果的自訂文字，與 lotteryImages 對應
const lotteryMessages = [
  'ブウルウニーどれ～～', // brownie1.jpg
  'やったー！！ピンクブランウニー、たべだい～～', // brownie2.jpg
  'グリーウニーどれ～～', // brownie3.jpg
  'ママ〜〜、焦げたブラウニーはイヤだ～～' // brownie4.jpg
];

// 遮罩顏色陣列
const overlayColors = ['#FF9999', '#ADD8E6', '#CCFFCC', '#FFFFCC', '#FFCC99', '#FFB6C1'];

// 預載圖片的函數
function preloadImages(imageArray, callback) {
  let loadedCount = 0;
  const totalImages = imageArray.length;

  imageArray.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === totalImages && callback) {
        callback();
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === totalImages && callback) {
        callback();
      }
    };
  });
}

function getRandomImage(images, probs) {
  const rand = Math.random() * 100;
  let cumulativeProb = 0;

  for (let i = 0; i < probs.length; i++) {
    cumulativeProb += probs[i];
    if (rand <= cumulativeProb) {
      return images[i];
    }
  }
  return images[images.length - 1];
}

function getRandomAnimation() {
  const randomIndex = Math.floor(Math.random() * animationStyles.length);
  return animationStyles[randomIndex];
}

function getRandomSpinDuration() {
  return Math.random() * (6 - 2) + 2; // 隨機 2 到 6 秒
}

function getRandomLotteryDuration() {
  return Math.random() * (8 - 3) + 3; // 隨機 3 到 8 秒
}

function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * overlayColors.length);
  return overlayColors[randomIndex];
}

function createAnimationElement(container, direction) {
  const animationElement = document.createElement('div');
  animationElement.className = 'arrow-animation';

  let selectedImage;
  let isGuaranteed = false;
  if (clickCount >= 50) {
    selectedImage = direction === 'next' ? leftToRightImages[4] : rightToLeftImages[4];
    isGuaranteed = true;
  } else {
    selectedImage = direction === 'next'
      ? getRandomImage(leftToRightImages, probabilities)
      : getRandomImage(rightToLeftImages, probabilities);
  }

  animationElement.style.backgroundImage = `url('${selectedImage}')`;
  animationElement.classList.add(getRandomAnimation());

  if (selectedImage === 'boinboin.png') {
    const winMessage = document.createElement('div');
    winMessage.className = 'win-message';
    winMessage.textContent = isGuaranteed ? '天井です！！( ﾟДﾟﾉﾉ☆ﾊﾟﾁﾊﾟﾁﾊﾟﾁﾊﾟﾁ' : '大当たり！！！';
    container.insertBefore(winMessage, container.children[1]);

    animationElement.addEventListener('animationend', () => {
      winMessage.remove();
    });

    clickCount = 0;
  }

  container.insertBefore(animationElement, container.children[1]);
}

const tableContainer = document.getElementById('table-container');
const slideshowContainer = document.getElementById('slideshow-container');
const slideshowImage = document.getElementById('slideshow-image');
const returnButton = document.getElementById('return-button');
const wheelContainer = document.getElementById('wheel-container');
const wheelText = document.getElementById('wheel-text');
const wheel = document.getElementById('wheel');
const wheelPointer = document.querySelector('.wheel-pointer');
const wheelResult = document.getElementById('wheel-result');
const lotteryContainer = document.getElementById('lottery-container');
const lotteryText = document.getElementById('lottery-text');
const lotteryGrid = document.getElementById('lottery-grid');
const lotteryResult = document.getElementById('lottery-result');
const prevArrowTop = document.getElementById('prev-arrow-top');
const nextArrowTop = document.getElementById('next-arrow-top');
const prevArrowBottom = document.getElementById('prev-arrow-bottom');
const nextArrowBottom = document.getElementById('next-arrow-bottom');
const navArrowsTop = document.getElementById('nav-arrows-top');
const navArrowsBottom = document.getElementById('nav-arrows-bottom');

function setupWheel() {
  const numSections = wheelOptions.length;
  const anglePerSection = 360 / numSections;

  wheelOptions.forEach((option, index) => {
    const section = document.createElement('div');
    section.className = 'wheel-section';
    section.style.transform = `rotate(${index * anglePerSection}deg)`;
    const label = document.createElement('span');
    label.textContent = option.text;
    label.style.transform = `rotate(${option.angle}deg)`;
    label.style.top = option.top;
    label.style.left = option.left;
    section.appendChild(label);
    wheel.appendChild(section);
  });

  // 設置轉盤的初始文字
  wheelText.textContent = '🔥チャンスは一度きりだーーー！！🔥';
}

function setupLottery() {
  lotteryGrid.innerHTML = ''; // 清空現有內容

  lotteryImages.forEach((imageSrc, index) => {
    const item = document.createElement('div');
    item.className = 'lottery-item';

    const image = document.createElement('img');
    image.className = 'lottery-image loading'; // 初始設為 loading 狀態
    image.src = imageSrc;
    image.alt = `抽選圖片 ${index + 1}`;
    image.id = `lottery-image-${index}`; // 為圖片添加 ID

    // 圖片載入完成後移除 loading 類別
    image.onload = () => {
      image.classList.remove('loading');
    };

    const overlay = document.createElement('div');
    overlay.className = 'lottery-overlay';
    overlay.id = `overlay-${index}`;

    item.appendChild(image);
    item.appendChild(overlay);
    lotteryGrid.appendChild(item);

    // 為遮罩添加點擊事件（抽選進行前）
    overlay.addEventListener('click', () => {
      const overlays = document.querySelectorAll('.lottery-overlay');
      // 如果遮罩可見，則直接執行抽選
      if (overlays[0].style.display !== 'none') {
        startLottery();
      }
    });

    // 為圖片添加點擊事件（抽選結束後）
    image.addEventListener('click', () => {
      const overlays = document.querySelectorAll('.lottery-overlay');
      // 如果遮罩隱藏（抽選已完成），則重置並重新抽選
      if (overlays[0].style.display === 'none') {
        resetLottery();
        startLottery();
      }
    });
  });
}

// 重置抽選狀態
function resetLottery() {
  const overlays = document.querySelectorAll('.lottery-overlay');
  const images = document.querySelectorAll('.lottery-image');
  overlays.forEach(overlay => {
    overlay.style.display = 'block';
    overlay.style.backgroundColor = '#CCCCCC';
  });
  images.forEach(image => {
    image.classList.remove('selected');
  });
  lotteryText.textContent = 'どれ たべたい~';
  lotteryResult.style.display = 'none';
}

function startLottery() {
  const overlays = document.querySelectorAll('.lottery-overlay');
  const images = document.querySelectorAll('.lottery-image');

  // 如果遮罩已經隱藏（抽選已完成），則不執行抽選（因為會在點擊圖片時重置）
  if (overlays[0].style.display === 'none') return;

  lotteryText.textContent = '抽選中…';
  const lotteryDuration = getRandomLotteryDuration() * 1000; // 轉為毫秒
  const colorChangeInterval = 200; // 每 200ms 變換一次顏色

  const colorChange = setInterval(() => {
    overlays.forEach(overlay => {
      overlay.style.backgroundColor = getRandomColor();
    });
  }, colorChangeInterval);

  setTimeout(() => {
    clearInterval(colorChange);

    const selectedIndex = Math.floor(Math.random() * lotteryImages.length);
    overlays.forEach((overlay, index) => {
      overlay.style.display = 'none'; // 移除所有遮罩，顯示所有圖片
      const image = document.getElementById(`lottery-image-${index}`);
      if (index === selectedIndex) {
        image.classList.add('selected'); // 為選中圖片添加外框
        lotteryResult.textContent = lotteryMessages[selectedIndex]; // 使用自訂文字
        lotteryResult.style.display = 'block';
      }
    });

    lotteryText.textContent = '結果発表！！'; // 修改為新文字
  }, lotteryDuration);
}

function simulateTickSound(spinDuration) {
  const tickInterval = 100; // 每 100ms 模擬一次「搭」聲
  const totalTicks = Math.floor((spinDuration * 1000) / tickInterval);
  let currentTick = 0;

  const tick = setInterval(() => {
    if (currentTick >= totalTicks) {
      clearInterval(tick);
      return;
    }
    wheelPointer.classList.add('tick'); // 觸發指針抖動動畫
    currentTick++;
  }, tickInterval);
}

function spinWheel() {
  if (wheel.style.transition !== '') return; // 防止重複點擊

  // 開始新的旋轉時，隱藏之前的結果
  wheelResult.style.display = 'none';

  const numSections = wheelOptions.length;
  const randomIndex = Math.floor(Math.random() * numSections);
  const anglePerSection = 360 / numSections;
  const randomAngle = randomIndex * anglePerSection + (Math.random() * anglePerSection);
  const totalRotation = currentWheelRotation + 360 * 5 + randomAngle; // 從當前角度開始旋轉
  const spinDuration = getRandomSpinDuration(); // 隨機 2 到 6 秒

  wheel.style.transition = `transform ${spinDuration}s ease-out`;
  wheel.style.transform = `rotate(${totalRotation}deg)`;
  currentWheelRotation = totalRotation; // 更新當前旋轉角度

  // 模擬「搭搭聲」
  simulateTickSound(spinDuration);

  setTimeout(() => {
    const finalAngle = totalRotation % 360;
    const selectedIndex = Math.floor((360 - finalAngle) / anglePerSection) % numSections;
    wheelResult.textContent = wheelMessages[selectedIndex]; // 使用自訂文字
    wheelResult.style.display = 'block'; // 顯示結果並保持顯示

    wheel.style.transition = '';
  }, spinDuration * 1000);
}

function renderRow(rowIndex) {
  tableContainer.innerHTML = '';

  const row = tableData[rowIndex];
  const rowDiv = document.createElement('div');
  rowDiv.className = 'table-row';
  const filteredRow = row.filter(cell => cell !== '' && cell !== null && cell !== undefined);
  filteredRow.forEach(cell => {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'table-cell';
    const formattedCell = (cell || '').replace(/\n/g, '<br>');
    cellDiv.innerHTML = formattedCell;
    rowDiv.appendChild(cellDiv);
  });
  tableContainer.appendChild(rowDiv);

  // 添加切換到投影片的按鈕
  const toSlideshowButton = document.createElement('button');
  toSlideshowButton.className = 'to-slideshow-button';
  toSlideshowButton.textContent = 'ボツ企画を見る';
  toSlideshowButton.addEventListener('click', () => {
    enterSlideshowMode();
  });
  tableContainer.appendChild(toSlideshowButton);

  const isFirstRow = rowIndex === 0;
  const isLastRow = rowIndex === tableData.length - 1;
  prevArrowTop.disabled = isFirstRow;
  nextArrowTop.disabled = isLastRow;
  prevArrowBottom.disabled = isFirstRow;
  nextArrowBottom.disabled = isLastRow;
  prevArrowTop.classList.toggle('disabled', isFirstRow);
  nextArrowTop.classList.toggle('disabled', isLastRow);
  prevArrowBottom.classList.toggle('disabled', isFirstRow);
  nextArrowBottom.classList.toggle('disabled', isLastRow);

  // 只有在最後一頁顯示切換按鈕
  toSlideshowButton.style.display = isLastRow ? 'block' : 'none';
}

function renderSlide(slideIndex) {
  slideshowImage.classList.add('loading'); // 顯示載入中提示
  slideshowImage.src = slideshowImages[slideIndex];
  slideshowImage.alt = `投影片 ${slideIndex + 1}`;

  // 圖片載入完成後移除 loading 類別
  slideshowImage.onload = () => {
    slideshowImage.classList.remove('loading');
  };
}

// 根據 currentPageIndex 渲染頁面
function renderPage(pageIndex) {
  // 隱藏所有頁面
  slideshowContainer.style.display = 'none';
  wheelContainer.style.display = 'none';
  lotteryContainer.style.display = 'none';

  // 根據 pageIndex 顯示對應頁面
  switch (pageIndex) {
    case 0: // A: 投影片1
      slideshowContainer.style.display = 'block';
      renderSlide(0); // 投影片1
      break;
    case 1: // B: 轉盤
      wheelContainer.style.display = 'block';
      wheelResult.style.display = 'none'; // 隱藏之前的轉盤結果
      wheelText.textContent = '🔥チャンスは一度きりだーーー！！🔥'; // 確保進入頁面時顯示正確文字
      break;
    case 2: // C: 投影片2
      slideshowContainer.style.display = 'block';
      renderSlide(1); // 投影片2
      break;
    case 3: // D: 抽獎
      lotteryContainer.style.display = 'block';
      resetLottery(); // 進入抽獎頁面時重置狀態
      break;
    case 4: // E: 投影片3
      slideshowContainer.style.display = 'block';
      renderSlide(2); // 投影片3
      break;
  }

  // 更新按鈕狀態
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === pages.length - 1;
  prevArrowTop.disabled = isFirstPage;
  nextArrowTop.disabled = isLastPage;
  prevArrowBottom.disabled = isFirstPage;
  nextArrowBottom.disabled = isLastPage;
  prevArrowTop.classList.toggle('disabled', isFirstPage);
  nextArrowTop.classList.toggle('disabled', isLastPage);
  prevArrowBottom.classList.toggle('disabled', isFirstPage);
  nextArrowBottom.classList.toggle('disabled', isLastPage);
}

function enterSlideshowMode() {
  isSlideshowMode = true;
  currentPageIndex = 0; // 從 A 開始
  tableContainer.style.display = 'none';
  renderPage(currentPageIndex);
}

function exitSlideshowMode() {
  isSlideshowMode = false;
  currentPageIndex = 0;
  slideshowContainer.style.display = 'none';
  wheelContainer.style.display = 'none';
  lotteryContainer.style.display = 'none';
  tableContainer.style.display = 'block';
  renderRow(currentRowIndex);
}

function loadData() {
  tableContainer.innerHTML = '<p>読み込み中…</p>';

  // 預載所有圖片
  const allImages = [
    ...slideshowImages,
    ...lotteryImages,
    ...leftToRightImages,
    ...rightToLeftImages,
    '乙夏れいファンLOGO.png',
    'daikon.png'
  ];

  preloadImages(allImages, () => {
    fetch(appsScriptUrl, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => {
        if (!data || data.length === 0) {
          tableContainer.innerHTML = '<p>データが見つかりません。</p>';
          return;
        }

        tableData = data;

        if (tableData.length === 0) {
          tableContainer.innerHTML = '<p>データが見つかりません。</p>';
          return;
        }

        currentRowIndex = 0;
        renderRow(currentRowIndex);
        setupArrowEvents();
        setupWheel();
        setupLottery();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        tableContainer.innerHTML = '<p>データの取得に失敗しました。詳細エラー: ' + error.message + '</p>';
      });
  });
}

function setupArrowEvents() {
  // 動態修改前後按鈕的文字
  prevArrowTop.textContent = '← 前へ';
  nextArrowTop.textContent = '次へ →';
  prevArrowBottom.textContent = '← 前へ';
  nextArrowBottom.textContent = '次へ →';

  prevArrowTop.addEventListener('click', () => {
    if (isSlideshowMode) {
      if (currentPageIndex > 0) {
        currentPageIndex--;
        renderPage(currentPageIndex);
        createAnimationElement(navArrowsTop, 'prev');
      }
    } else {
      if (currentRowIndex > 0) {
        clickCount++;
        currentRowIndex--;
        renderRow(currentRowIndex);
        createAnimationElement(navArrowsTop, 'prev');
      }
    }
  });

  nextArrowTop.addEventListener('click', () => {
    if (isSlideshowMode) {
      if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        renderPage(currentPageIndex);
        createAnimationElement(navArrowsTop, 'next');
      }
    } else {
      if (currentRowIndex < tableData.length - 1) {
        clickCount++;
        currentRowIndex++;
        renderRow(currentRowIndex);
        createAnimationElement(navArrowsTop, 'next');
      }
    }
  });

  prevArrowBottom.addEventListener('click', () => {
    if (isSlideshowMode) {
      if (currentPageIndex > 0) {
        currentPageIndex--;
        renderPage(currentPageIndex);
        createAnimationElement(navArrowsBottom, 'prev');
      }
    } else {
      if (currentRowIndex > 0) {
        clickCount++;
        currentRowIndex--;
        renderRow(currentRowIndex);
        createAnimationElement(navArrowsBottom, 'prev');
      }
    }
  });

  nextArrowBottom.addEventListener('click', () => {
    if (isSlideshowMode) {
      if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        renderPage(currentPageIndex);
        createAnimationElement(navArrowsBottom, 'next');
      }
    } else {
      if (currentRowIndex < tableData.length - 1) {
        clickCount++;
        currentRowIndex++;
        renderRow(currentRowIndex);
        createAnimationElement(navArrowsBottom, 'next');
      }
    }
  });

  returnButton.addEventListener('click', () => {
    exitSlideshowMode();
  });

  wheel.addEventListener('click', () => {
    if (currentPageIndex === 1) { // 當前頁面是轉盤 (B)
      spinWheel();
    }
  });
}

loadData();