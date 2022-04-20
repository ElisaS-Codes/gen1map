"use strict";
//LOAD
const loadJSon = async (url) => {
    const response = await fetch(url);
    return await response.json();
}

const loadImage = (url) => {
    const tilemap =  new Image();
    tilemap.src = url
    return tilemap
}

//Globals
let tileSet, spriteSet, mapObj, interiorsObj, palleteArr

let fullMap = document.createElement('canvas')
let interiorMap = document.createElement('canvas')

//docGolbals
const viewport = document.getElementById('canvas')
viewport.getContext('2d').imageSmoothingEnabled = false
viewport.width = viewport.clientWidth
viewport.height = viewport.clientHeight

//Viewport event
document.onkeydown = keyPress
viewport.onwheel = wheelScroll
viewport.onmousedown = onMouseDown
viewport.onmouseup = onMouseUp
viewport.onmousemove = onMouseMove
viewport.onmouseleave = onMouseLeave

async function start() {
    tileSet = loadImage("resources/tilemapRed.png")
    spriteSet = loadImage("resources/spriteRed.png")
    mapObj = await loadJSon("resources/map.json")
    interiorsObj = await loadJSon("resources/interiors.json")
    palleteArr = await loadJSon("resources/pallete.json")

    fullMap.width = mapObj.sizeX * 16
    fullMap.height = mapObj.sizeY * 16

    drawMap()

    drawViewport()
}

start()