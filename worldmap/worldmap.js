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
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  imageMode(CENTER);
  angleMode(DEGREES);

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

  // 暗闇の中で3Dモデルやドットが妖しく光るよう、ライトの当たり方を調整
  ambientLight(60); 
  directionalLight(200, 230, 255, 0.5, 1, -0.3); // 青白いサイバーな光

  let rows = worldGrid.length;
  let cols = worldGrid[0].length;
  let startX = -(cols * spacing) / 2;
  let startY = -(rows * spacing) / 2;

  translate(offsetX, offsetY);
  scale(zoom);

  // マウスの3D空間上での現在位置を逆算（周辺検知用）
  let adjustedMouseX = (mouseX - width / 2 - offsetX) / zoom;
  let adjustedMouseY = (mouseY - height / 2 - offsetY) / zoom;

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
          let img = getCountryImage(tile);
          noStroke();
          texture(img); 
          plane(dotSize, dotSize);
  
          texture(pg);
          plane(dotSize, dotSize);
          
          if (isRepresentativeDot(tile, r, c)) {
            let countryModel = getCountryModel(tile);
            let bbox = countryModel.calculateBoundingBox();
            push();
            
            if(tile === 2) {
              translate(0-spacing/2, 0-spacing/2, bbox.size.z);
              rotateX(90);
              scale(0.5);
            }
            else if (tile === 3) {
              translate(0, 0+spacing/2, -10+bbox.size.y/2);
              scale(0.3);
            }
            else if (tile === 4) {
                translate(0, 0, bbox.size.z/17);
                rotateX(90);
                scale(0.15);
            }
            else if (tile === 5) {
                translate(0, 0, bbox.size.z/15);
                rotateX(90);
                scale(0.15);
            }
            else if (tile === 6) {
              translate(0, 0, bbox.size.z/2);
              rotateX(90);
              scale(0.3);
            }

            
            // 暗闇に浮かぶワイヤーフレームを白く発光させる
            stroke(240, 250, 255); 
            strokeWeight(0.08); 
            noFill();
            model(countryModel);
            pop();
          }
          pop();
          
        } else {
          
          // マウスとこのドットの距離を計算
          let d = dist(x, y, adjustedMouseX, adjustedMouseY);
          
          // マウスが近づくほど（距離dが小さいほど）大きくなる倍率を計算
          let mouseEffect = 1.0;
          let isNearMouse = false;
          if (d < 45) { // マウスから半径45ピクセル以内なら反応
            mouseEffect = map(d, 0, 45, 1.8, 1.0); 
            isNearMouse = true;
          }

          noStroke();
          
          // 発光と色の設定
          let maxDistance = 70;

          let normalAmbient = [110, 86, 116];
          let centerAmbient = [205, 115, 135]; 
          let centerEmissive = [90, 40, 50];

          if (d < maxDistance) {
            // マウスに近いほど1.0（中心）、遠いほど0.0（外縁）になる比率（0.0 〜 1.0）を計算
             let amt = map(d, 0, maxDistance, 1.0, 0.0);
  
            // 変化のカーブを「じわっと溶ける」ように補正（Smoothstepの再現）
            amt = amt * amt * (3 - 2 * amt); 

            //  ambientMaterial のブレンド（緑からピンクへじわっと変化）
            let r_amb = lerp(normalAmbient[0], centerAmbient[0], amt);
            let g_amb = lerp(normalAmbient[1], centerAmbient[1], amt);
            let b_amb = lerp(normalAmbient[2], centerAmbient[2], amt);
            ambientMaterial(r_amb, g_amb, b_amb);

            // emissiveMaterial のブレンド（外側は0、中心に近づくほど発光）
            let r_emi = lerp(0, centerEmissive[0], amt);
            let g_emi = lerp(0, centerEmissive[1], amt);
            let b_emi = lerp(0, centerEmissive[2], amt);
            emissiveMaterial(r_emi, g_emi, b_emi);
            
            // マウスが近づくほど大きくなる倍率
            let mouseEffect = map(amt, 0, 1, 1.0, 1.8);

          } else {
            // 通常時（完全にマウスの範囲外）
            ambientMaterial(normalAmbient[0], normalAmbient[1], normalAmbient[2]);
            emissiveMaterial(0); // 発光なし
          }

          // ズーム連動型の形状変化
          // zoomが1.3以上なら滑らかな「球体」、それ以下ならデジタルな「立方体」
          let currentSize = (dotSize / 2) * mouseEffect;
          
          if (zoom >= 1.3) {
            sphere(currentSize); // 解像度高：有機的な球体
          } else {
            box(currentSize * 1.5); // 解像度低：カクカクしたデジタル立方体
          }
        }
        pop();
      }
    }
  }
}


function getCountryImage(num) {
  if (num === 2) return usaImg;
  if (num === 3) return franceImg;
  if (num === 4) return indiaImg;
  if (num === 5) return japanImg;
  if (num === 6) return brazilImg;
}

function isRepresentativeDot(num, r, c) {
  if (num === 2) return (r === 14  && c === 46); 
  if (num === 3) return (r === 12 && c === 3);  
  if (num === 4) return (r === 18 && c === 16); 
  if (num === 5) return (r === 15 && c === 26); 
  if (num === 6) return (r === 22 && c === 53); 
  return false;
}

function getCountryModel(num) {
  if (num === 2) return usaModel;
  if (num === 3) return franceModel;
  if (num === 4) return indiaModel;
  if (num === 5) return japanModel;
  if (num === 6) return brazilModel;
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
  let startX = (width - cols * spacing) / 2;
  let startY = (height - rows * spacing) / 2;

  let adjustedMouseX = (mouseX - width / 2 - offsetX) / zoom + width / 2;
  let adjustedMouseY = (mouseY - height / 2 - offsetY) / zoom + height / 2;

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