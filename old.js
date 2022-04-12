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

//INTERACTION
const moveCamera = (newPos) => {
    cameraPos = newPos

    drawMain()
}

const changeZoom = (newZoom) => {
    zoom = newZoom

    drawMain()
}

//DRAW
const drawTile = (context, tile, posX, posY, palett) => {
    context.drawImage(
        tileMap,
        (tile % 10) * 16,
        Math.trunc(tile / 10) * 16,
        16, 16,
        posX,
        posY,
        16 , 16
    )
}

const drawMain = () => {

    mainCCtx.clearRect(0, 0, mainC.width, mainC.height);

    const width = Math.trunc(mainSize[0]/16) + 1
    const height = Math.trunc(mainSize[1]/16) + 1
    const offX = -cameraPos[0] % 16
    const offY = -cameraPos[1] % 16
    let start = (Math.trunc(cameraPos[1]/16) * map.sizeX) + (Math.trunc(cameraPos[0]/16))
    let skip = (Math.trunc(cameraPos[0]/16))
    start = (start > 0) ? start : 0
    for (let i = start, x = 0, y = 0 ; i < map.array.length; i++) {

        drawTile(
            mainCCtx,
            map.array[i],
            offX + x * 16,
            offY + y * 16,
            'pallet'
        )

        x++
        if(x + skip >= map.sizeX || x * 16 > mainSize[0]) {
            i += (map.sizeX - width > 0) ? map.sizeX - width + skip : 0 + skip
            x = 0
            y++
            if (y >= height) break
        }
    }
}

//Globals
let tileMap, map, palletArray
let cameraPos = [0,0]
let mainSize = [100,100]
let zoom = 1

//docGolbals
const mainC = document.getElementById('canvas');
const mainCCtx = mainC.getContext('2d');

async function start() {
    tileMap = loadImage("resources/tilemapRed.png")
    map = await loadJSon("resources/map.json")
    palletArray = await loadJSon("resources/pallete.json")

    drawMain()
}

start()