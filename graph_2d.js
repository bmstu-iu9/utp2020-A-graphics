'use strict';

let canvas;
let ctx;

let clientHeight; // высота холста
let clientWidth; // ширина холста

let expr; //текст входной функции

//область определения входной функции
let minX;
let maxX;
let minY;
let maxY;

//коэффициенты перехода от системы координат входной функции к системе координат экрана
let scaleX = 1;
let scaleY = 1;

let deltaX;

const indent = 50; // отступ от границ
const BLACK = '#000000';
const WHITE = '#AAAAAA';
const TEXT_FONT = "18pt Times New Roman";
const MAX_DRAW_LEVEL = 100;

const π = Math.pi;
let abs = Math.abs;
let cos = Math.cos;
let arccos = Math.acos;
let sin = Math.sin;
let arcsin = Math.asin;
let tg = Math.tan;
let arctg = Math.atan;
let pow = Math.pow;
let sqrt = Math.sqrt;
let exp = Math.exp;
let ln = Math.log;

function ctg(x){
  return 1 / tg(x);
};

function arcctg(x) {
  return π * .5 - arctg(x);
};

function draw() {
  init();

  drawCoordinatesSystem();

  drawGraph()
};

//инициализация входных данных и подготовка области для отрисовки
function init() {
  canvas = document.getElementById('graph');
  ctx = canvas.getContext('2d');
  clientHeight = canvas.clientHeight;
  clientWidth = canvas.clientWidth;
  ctx.clearRect(0, 0, clientWidth, clientHeight);

  minX = Number(getElementValue('minX'));
  maxX = Number(getElementValue('maxX'));
  if (isNaN(minX) || isNaN(maxX) || minX >= maxX) {
    throw new Error('X limits are not correct');
  };
  minY = Number(getElementValue('minY'));
  maxY = Number(getElementValue('maxY'));
  if (isNaN(minY) || isNaN(maxY) || minY >= maxY) {
    throw new Error('Y limits are not correct');
  };
  //создание функции из входной строки
  expr = new Function('x', 'return ' + func.value);

  const doubleIndent = 2 * indent;
  let innerWidth = clientWidth - doubleIndent;
  let innerHeight = clientHeight - doubleIndent;
  let canvasWidth = maxX - minX;
  deltaX = canvasWidth / innerWidth;

  // отрисовка квадрата на холсте
  ctx.fillStyle = BLACK;
  ctx.strokeRect(0, 0, clientWidth, clientHeight);
  ctx.strokeStyle = WHITE;
  ctx.strokeRect(indent, indent, innerWidth, innerHeight);

  //инициализация переменных масштабирования
  scaleX = innerWidth / canvasWidth;
  scaleY = innerHeight / (maxY - minY);
};

function getElementValue(name) {
  return document.getElementById(name).value
};

function drawCoordinatesSystem() {
  ctx.strokeStyle = BLACK;
  ctx.font = TEXT_FONT;
  const halfIndent = indent / 2;
  const quarterIndent = halfIndent / 2;
  ctx.fillText(maxY, quarterIndent, indent);
  let h1 = clientHeight - indent;
  ctx.fillText(minY, quarterIndent, h1);
  let h2 = clientHeight - halfIndent;
  ctx.fillText(minX, quarterIndent * 3, h2);
  ctx.fillText(maxX, clientWidth - quarterIndent * 5, h2);
  const arrowProp = 10;
  const zeroX = transformX(0);
  const zeroY = transformY(0);
  const arrowWidth = indent / arrowProp;
  const arrowHeight = arrowWidth * (arrowProp - 1);
  if (zeroX >= indent && zeroX <= h1) {
    ctx.beginPath();
    ctx.moveTo(zeroX, h1);
    ctx.lineTo(zeroX, halfIndent);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineTo(zeroX - arrowWidth, arrowHeight);
    ctx.lineTo(zeroX + arrowWidth, arrowHeight);
    ctx.lineTo(zeroX, halfIndent);
    ctx.fill();
    ctx.fillText("Y", zeroX, halfIndent);
    if (minX != 0 && maxX != 0) {
      ctx.fillText("0", zeroX, h2);
    }
  }
  if (zeroY >= indent && zeroY <= h1) {
    ctx.beginPath();
    ctx.moveTo(indent, zeroY);
    let w1 = clientWidth - halfIndent;
    ctx.lineTo(w1, zeroY);
    ctx.stroke();
    ctx.beginPath();
    let w2 = clientWidth - arrowHeight;
    ctx.lineTo(w2, zeroY - arrowWidth);
    ctx.lineTo(w2, zeroY + arrowWidth);
    ctx.lineTo(w1, zeroY);
    ctx.fill();
    ctx.fillText("X", w1, zeroY);
    if (minY != 0 && maxY != 0) {
      ctx.fillText("0", halfIndent, zeroY);
    }
  }
};

//преобразование координат x
function transformX(x) {
  return Math.round((x - minX) * scaleX + indent);
};

//преобразование координат y
function transformY(y) {
  return Math.round((maxY - y) * scaleY + indent);
};

function drawGraph() {
  ctx.fillStyle = BLACK;
  ctx.beginPath();

  let prevX = minX;
  let curX = prevX;
  let numPoints = 2 * clientHeight;
  while (curX <= maxX) {
    drawPoints(prevX, curX, numPoints);
    prevX = curX;
    curX = prevX + deltaX;
  }
  ctx.stroke();
};

function almostEqual(x, y) {
  return Math.abs(x - y) < Number.EPSILON * Math.max(Math.abs(x), Math.abs(y));
}

function validateYCoord(y) {
  return !(isNaN(y) || y == Infinity || y == -Infinity || y > maxY || y < minY);
}

function drawPoints(prevX, curX, numPoints) {
  let countPoints = 0;
  let drawLevel = 0;

  function drawPointRec(prevX, curX) {
    if (countPoints >= numPoints || drawLevel > MAX_DRAW_LEVEL) {
      return;
    }
    ++drawLevel;
    const prevY = expr(prevX);
    const curY = expr(curX);
    if (validateYCoord(prevY) || validateYCoord(curY)) {
      const screenCurY = transformY(curY);
      if (Math.abs(screenCurY - transformY(prevY)) <= 1) {
        ctx.fillRect(transformX(curX), screenCurY, 1, 1);
        ++countPoints;
      } else {
        if (almostEqual(curX, prevX)) {
          drawPoint(curX, curX);
        } else {
          const midX = (prevX + curX) / 2;
          drawPointRec(prevX, midX);
          drawPointRec(midX, curX);
        }
      }
    }
    --drawLevel;
  }
  drawPointRec(prevX, curX);
};

function buttonOnClick(e) {
  clearVariables();
  try {
    draw();
  } catch (err) {
    result.innerText = err.message;
  }
}

function clearVariables() {
  minX = maxX = minY = maxY = undefined;
  deltaX = 0;
  scaleX = scaleY = 1;
  result.innerText = "";
};
