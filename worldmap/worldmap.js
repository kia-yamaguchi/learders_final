let worldGrid = [];
let dotSize = 15; // ドットの大きさ
let spacing = 20; // ドットの間隔（ドットのサイズ＋隙間）

let selectedCountries = [];

// ズームと移動のための変数
let zoom = 1.0;      // 拡大率（1.0 = 100%）
let offsetX = 0;     // 画面のX方向の移動量
let offsetY = 0;     // 画面のY方向の移動量
let moveSpeed = 10;  // 矢印キーを押した時の移動スピード

let pg;
let usaImg;
let franceImg;
let indiaImg;
let japanImg;
let brazilImg;

let usaModel;
let franceModel;
let indiaModel;
let japanModel;
let brazilModel;
let modelSizes = {};

// 高速化用のマッピング変数をグローバルで宣言
let countryImages = {};
let countryModels = {};


function preload() {
  usaImg = loadImage('/asset/image/usa.jpg');
  franceImg = loadImage('/asset/image/france.jpg');
  indiaImg = loadImage('/asset/image/india.jpg');
  japanImg = loadImage('/asset/image/japan.jpg');
  brazilImg = loadImage('/asset/image/brazil.jpg');
  
  usaModel = loadModel('/asset/model/LibertStatue.obj', true);
  franceModel = loadModel('/asset/model/10067_Eiffel_Tower_v1_max2010_it1.obj', true);
  indiaModel = loadModel('/asset/model/tajmahal.obj', true);
  japanModel = loadModel('/asset/model/him00obj.obj', true);
  brazilModel = loadModel('/asset/model/Christ the Redeemer-bl.obj', true);
}

function setup() {
  // スマホの高解像度ディスプレイによる負荷を抑える（効果大）
  pixelDensity(1);

  createCanvas(windowWidth, windowHeight, WEBGL);
  
  imageMode(CENTER);
  angleMode(DEGREES);

  // マッピングの初期化
  countryImages = { 2: usaImg, 3: franceImg, 4: indiaImg, 5: japanImg, 6: brazilImg };
  countryModels = { 2: usaModel, 3: franceModel, 4: indiaModel, 5: japanModel, 6: brazilModel }; // 💡日本のモデルをjapanModelに修正

  // モデルのサイズ（BoundingBox）を事前に1回だけ計算してキャッシュする
  modelSizes[2] = usaModel.calculateBoundingBox().size;
  modelSizes[3] = franceModel.calculateBoundingBox().size;
  modelSizes[4] = indiaModel.calculateBoundingBox().size;
  modelSizes[5] = japanModel.calculateBoundingBox().size; 
  modelSizes[6] = brazilModel.calculateBoundingBox().size;

  let savedCountries = localStorage.getItem('selectedCountriesData');
  if (savedCountries) {
    selectedCountries = JSON.parse(savedCountries);
    localStorage.removeItem('selectedCountriesData');
  }
  
  // 世界地図データ
  worldGrid = [
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,0, 1,1,1,1,1, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,1,1,0,0, 0,0,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,0, 0,0,0,0,2, 2,2,0,0,0, 0,0,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,0,2, 2,2,2,1,1, 1,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,1, 1,1,1,0,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,0,0,2,2, 2,2,2,1,1, 1,1,1,1,1, 1,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,1,1, 0,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,2, 2,2,2,1,1, 1,1,1,1,1, 1,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,1,1, 0,0,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,1,0, 0,0,0,0,2, 2,2,0,1,1, 1,1,1,1,1, 0,0,0,1,1, 1,0,0,0,0, 0],
    [0, 0,1,0,0,0, 0,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,0,0,1,0, 0,0,0,0,2, 0,0,0,0,0, 1,1,1,1,1, 1,1,0,1,1, 1,0,0,0,0, 0],
    [0, 0,1,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,0,0, 0],
    [0, 0,0,3,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 2,2,2,2,2, 2,1,1,1,1, 0,0,0,0,0, 0],
    [0, 0,0,3,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 2,2,2,2,2, 2,2,2,2,2, 0,0,0,0,0, 0],
    [0, 0,1,1,0,1, 0,0,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,0, 5,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,2,2,2,2, 2,2,2,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,0,5, 5,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,2,2,2,2, 2,2,2,0,0, 0,0,0,0,0, 0],
    [0, 0,1,1,1,1, 1,1,1,1,1, 0,1,1,1,1, 1,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,1,1,1, 0,0,2,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,0,1, 1,0,0,1,4, 4,4,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,0,1, 1,0,0,0,4, 4,0,0,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,0,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,1,0, 0,0,0,0,4, 4,0,0,1,1, 0,0,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,1,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,1,0, 0,0,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 1,1,1,0,0, 0],
    [0, 0,0,0,0,1, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 6,6,6,6,0, 0],
    [0, 0,0,0,0,0, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 6,6,6,6,6, 0],
    [0, 0,0,0,0,0, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,6,6, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,6,0, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,0,0, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,0,0, 0],
    [0, 0,0,0,0,0, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,1,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0]
  ];
  
  pg = createGraphics(150, 150); 
  pg.background(18, 22, 32);
  pg.erase();
  pg.ellipse(pg.width / 2, pg.height / 2, pg.width, pg.height);
  pg.noErase();
}


function draw() {
  background(20, 24, 34); 
  
  handleKeyboardInput();
  orbitControl();

  ambientLight(60); 
  directionalLight(200, 230, 255, 0.5, 1, -0.3); 

  let rows = worldGrid.length;
  let cols = worldGrid[0].length;
  let startX = -(cols * spacing) / 2;
  let startY = -(rows * spacing) / 2;

  translate(offsetX, offsetY);
  scale(zoom);

  // マウスの3D空間上での現在位置を逆算（周辺検知用）
  let adjustedMouseX = (mouseX - width / 2) / zoom - offsetX / zoom;
  let adjustedMouseY = (mouseY - height / 2) / zoom - offsetY / zoom;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let tile = worldGrid[r][c];
      if (tile > 0) {
        let x = startX + c * spacing;
        let y = startY + r * spacing;

        push();
        translate(x, y, 0); 
        
        let isSelected = selectedCountries.includes(tile);
      
        if (tile >= 2 && tile <= 6 && isSelected) {
          push(); 
          let img = countryImages[tile];
          noStroke();
          texture(img); 
          plane(dotSize, dotSize);
  
          texture(pg);
          plane(dotSize, dotSize);
          
          if (isRepresentativeDot(tile, r, c)) {
            let countryModel = countryModels[tile];
            // 💡【エラー修正】bboxを、事前に読み込んだsizeBBoxにすべて置き換え！
            let sizeBBox = modelSizes[tile];
            push();
            
            if(tile === 2) {
              translate(0 - spacing / 2, 0 - spacing / 2, sizeBBox.z);
              rotateX(90);
              scale(0.5);
            }
            else if (tile === 3) {
              translate(0, 0 + spacing / 2, -10 + sizeBBox.y / 2);
              scale(0.3);
            }
            else if (tile === 4) {
              translate(0, 0, sizeBBox.z / 17);
              rotateX(90);
              scale(0.15);
            }
            else if (tile === 5) {
              translate(0, 0, sizeBBox.z / 15);
              rotateX(90);
              scale(0.15);
            }
            else if (tile === 6) {
              translate(0, 0, sizeBBox.z / 2);
              rotateX(90);
              scale(0.3);
            }

            stroke(240, 250, 255); 
            strokeWeight(0.08); 
            noFill();
            model(countryModel);
            pop();
          }
          pop();
          
        } else {
          
          let d = dist(x, y, adjustedMouseX, adjustedMouseY);
          let mouseEffect = 1.0; // サイズ倍率のデフォルト値
          
          let maxDistance = 70;
          let normalAmbient = [110, 86, 116];
          let centerAmbient = [205, 115, 135]; 
          let centerEmissive = [90, 40, 50];

          // 後で stroke() に使うためのカラー変数を事前に用意
          let currentR = normalAmbient[0];
          let currentG = normalAmbient[1];
          let currentB = normalAmbient[2];

          if (d < maxDistance) {
            let amt = map(d, 0, maxDistance, 1.0, 0.0);
            amt = amt * amt * (3 - 2 * amt); // Smoothstep補正

            let r_amb = lerp(normalAmbient[0], centerAmbient[0], amt);
            let g_amb = lerp(normalAmbient[1], centerAmbient[1], amt);
            let b_amb = lerp(normalAmbient[2], centerAmbient[2], amt);
            ambientMaterial(r_amb, g_amb, b_amb);

            let r_emi = lerp(0, centerEmissive[0], amt);
            let g_emi = lerp(0, centerEmissive[1], amt);
            let b_emi = lerp(0, centerEmissive[2], amt);
            emissiveMaterial(r_emi, g_emi, b_emi);
            
            mouseEffect = map(amt, 0, 1, 1.0, 1.8);

          } else {
            // 通常時（完全にマウスの範囲外）
            ambientMaterial(normalAmbient[0], normalAmbient[1], normalAmbient[2]);
            emissiveMaterial(0); // 発光なし
          }

          // ドット本体と「全く同じ色」の枠線を、極限の細さ（0.2）で強制的に描きます。
          // これで網目（ワイヤーフレーム）のような黒いガタガタが消え、boxと同じ綺麗な色で発光します！
          stroke(currentR, currentG, currentB);
          strokeWeight(0.2);

          // サイズの計算（mouseEffectの適用）と形状の変化（sphere/box）だけをここで行います。
          let currentSize = (dotSize / 2) * mouseEffect;
          
          if (zoom >= 1.3) {
            sphere(currentSize); 
          } else {
            box(currentSize * 1.5);
          }
        }
        pop();
      }
    }
  }
}


function isRepresentativeDot(num, r, c) {
  if (num === 2) return (r === 14  && c === 46); 
  if (num === 3) return (r === 12 && c === 3);  
  if (num === 4) return (r === 18 && c === 16); 
  if (num === 5) return (r === 15 && c === 26); 
  if (num === 6) return (r === 22 && c === 53); 
  return false;
}


function handleKeyboardInput() {
  if (keyIsDown(ENTER) || keyIsDown(187) || keyIsDown(88)) zoom += 0.02;
  if (keyIsDown(189) || keyIsDown(90)) zoom = max(0.5, zoom - 0.02);

  if (keyIsDown(LEFT_ARROW))  offsetX += moveSpeed / zoom;
  if (keyIsDown(RIGHT_ARROW)) offsetX -= moveSpeed / zoom;
  if (keyIsDown(UP_ARROW))    offsetY += moveSpeed / zoom;
  if (keyIsDown(DOWN_ARROW))  offsetY -= moveSpeed / zoom;
}

function mouseClicked() {
  let rows = worldGrid.length;
  let cols = worldGrid[0].length;
  let startX = -(cols * spacing) / 2; // 💡【位置計算修正】3DのWEBGL基準に直しました
  let startY = -(rows * spacing) / 2;

  // 💡【位置計算修正】draw内と同じ最新のズーム対応逆算式に統一
  let adjustedMouseX = (mouseX - width / 2) / zoom - offsetX / zoom;
  let adjustedMouseY = (mouseY - height / 2) / zoom - offsetY / zoom;

  let clickedC = floor((adjustedMouseX - startX) / spacing);
  let clickedR = floor((adjustedMouseY - startY) / spacing);

  if (clickedC >= 0 && clickedC < cols && clickedR >= 0 && clickedR < rows) {
    let clickedTile = worldGrid[clickedR][clickedC];
    if (clickedTile >= 2 && clickedTile <= 6) {
         if (!selectedCountries.includes(clickedTile)) {
         selectedCountries.push(clickedTile);
        }

        if (clickedTile == 2) {
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         window.location.href = '/usa/usa.html';
         return;
        }
        if (clickedTile == 3) {
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         window.location.href = '/france/france.html';
         return;
        }
        if (clickedTile == 4) {
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         window.location.href = '/india/india.html';
         return;
        }
        if (clickedTile == 5) {
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         window.location.href = '/japan/japan.html';
         return;
        }
        if (clickedTile == 6) {
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         window.location.href = '/brazil/brazil.html';
         return;
        }
    }
  }
}