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

const indent = 50; // отступ от границ
const BLACK = '#000000';
const WHITE = '#AAAAAA';
const TEXT_FONT = "18pt Times New Roman";

function draw() {
  //инициализация
  init();

  //отрисовка системы координат
  drawCoordinatesSystem();
};

function getElementValue(name) {
  return document.getElementById(name).value
}

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

  // Отрисовка квадрата на холсте
  ctx.fillStyle = BLACK;
  ctx.strokeRect(0, 0, clientWidth, clientHeight);
  ctx.strokeStyle = WHITE;
  const doubleIndent = 2 * indent;
  ctx.strokeRect(indent, indent, clientWidth - doubleIndent, clientHeight - doubleIndent);

  //инициализация переменных масштабирования
  scaleX = (clientWidth - doubleIndent) / (maxX - minX);
  scaleY = (clientHeight - doubleIndent) / (maxY - minY);
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
  const arrowHeight = indent * (arrowProp - 1) / arrowProp;
  const arrowWidth = indent / arrowProp;
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

function clearVariables() {
  result.innerText = "";
  minX = maxX = minY = maxY = undefined;
};


//преобразование координат x
function transformX(x) {
  return Math.round((x - minX) * scaleX + indent);
};

//преобразование координат y
function transformY(y) {
  return Math.round((maxY - y) * scaleY + indent);
};

function buttonOnClick(e) {
  clearVariables();
  try {
    draw();
  } catch (err) {
    result.innerText = err.message;
  }
}
