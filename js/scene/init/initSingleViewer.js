// js/init/initSingleViewer.js
import { initSingleViewerDrop } from '../core/entrypoint.js';

const dropArea = document.querySelectorAll('#drop_zone')[1];
const inputFile = document.createElement('input');
inputFile.type = 'file';
inputFile.hidden = true;
document.body.appendChild(inputFile);

initSingleViewerDrop(dropArea, inputFile);
