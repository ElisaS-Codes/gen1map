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
const keyPress = (event) => {
    //console.log(event)

    switch (event.key){
        case "ArrowUp":
            cameraPos[1] += 5
            drawMain()
            break
        case "ArrowDown":
            cameraPos[1] -= 5
            drawMain()
            break
        case "ArrowLeft":
            cameraPos[0] += 5
            drawMain()
            break
        case "ArrowRight":
            cameraPos[0] -= 5
            drawMain()
            break
    }
}

const wheelScroll = (event) => {
    zoom += event.deltaY * 0.0005 

    if (zoom < 0.1) {
        zoom = 0.1
        return
    }

    cameraPos[0] -= event.deltaY * 0.0005 * mainC.width / 2
    cameraPos[1] -= event.deltaY * 0.0005 * mainC.height / 2

    drawMain()
}

const onMouseDown = (event) => {
    event.preventDefault()
    if (mapstate != 'waiting') return
    mapstate = 'drag'
    dragtemp = [event.x, event.y]
}

const onMouseUp = (event) => {
    event.preventDefault()
    if (mapstate != 'drag') return
    mapstate = 'waiting'
}

const onMouseMove = (event) => {
    event.preventDefault()
    if (mapstate != 'drag') return
    cameraPos = [cameraPos[0] + (dragtemp[0] - event.x) * zoom, cameraPos[1] + (dragtemp[1] - event.y) * zoom]
    dragtemp = [event.x, event.y]
    drawMain()
}

const onMouseLeave = (event) => {
    mapstate = 'waiting'
}

//DRAW
const drawTile = (context, tile, posX, posY, palett) => {

    //first, we apply the pallete
    const temp = document.createElement("canvas")
    const tempCtx = temp.getContext("2d")
    temp.width = 16
    temp.height = 16

    tempCtx.drawImage(tileMap, (tile % 10) * 16, Math.trunc(tile / 10) * 16, 16, 16, 0, 0, 16, 16)

    const tempImgData = tempCtx.getImageData(0,0,16,16)
    const tempData = tempImgData.data

    for (var i = 0; i < tempData.length; i += 4) {
        if (palett != 'bw') {
            if (tempData[i] === 248) { //white
                tempData[i] = palletArray[palett][0][0]
                tempData[i+1] = palletArray[palett][0][1]
                tempData[i+2] = palletArray[palett][0][2]
            } else if (tempData[i] === 168) { //light gray
                tempData[i] = palletArray[palett][1][0]
                tempData[i+1] = palletArray[palett][1][1]
                tempData[i+2] = palletArray[palett][1][2]
            } else if (tempData[i] === 96) { //dark gray
                tempData[i] = palletArray[palett][2][0]
                tempData[i+1] = palletArray[palett][2][1]
                tempData[i+2] = palletArray[palett][2][2]
            } else if (tempData[i] === 0) { //black
                tempData[i] = palletArray[palett][3][0]
                tempData[i+1] = palletArray[palett][3][1]
                tempData[i+2] = palletArray[palett][3][2]
            }
        }
    }

    context.putImageData(tempImgData,posX,posY)
}

const drawMap = () => {

    for (let i = 0 ; i < map.array.length; i++) {

        let x = i % map.sizeX
        let y = Math.trunc(i/map.sizeX)
        let pallet = 'bw'

        for(area of areas.palletes){
            if ((x >= area[0] && x <= area[2]) && (y >= area[1] && y <= area[3]))
                pallet = area[4]
        }

        drawTile(
            fullMapCtx,
            map.array[i],
            x * 16,
            y * 16,
            pallet
        )
    }
}

const drawMain = () => {

    mainCCtx.clearRect(0, 0, mainC.width, mainC.height);

    mainCCtx.drawImage(fullMap,
        cameraPos[0], cameraPos[1],
        mainC.width * zoom, mainC.height * zoom,
        0, 0,
        mainC.width, mainC.height
        )
}

//Globals
let tileMap, map, palletArray
let cameraPos = [0,0]
let zoom = 1

let mapstate = 'waiting'
let dragtemp = [0,0]

let fullMap = document.createElement('canvas')
let fullMapCtx = fullMap.getContext("2d")

//docGolbals
const mainC = document.getElementById('canvas')
const mainCCtx = mainC.getContext('2d')
mainCCtx.imageSmoothingEnabled = false
mainC.width = mainC.clientWidth;
mainC.height = mainC.clientWidth;

document.onkeydown = keyPress
document.onwheel = wheelScroll
mainC.onmousedown = onMouseDown
mainC.onmouseup = onMouseUp
mainC.onmousemove = onMouseMove
mainC.onmouseleave = onMouseLeave

async function start() {
    tileMap = loadImage("resources/tilemapRed.png")
    map = await loadJSon("resources/map.json")
    palletArray = await loadJSon("resources/pallete.json")
    areas = await loadJSon("resources/areas.json")

    fullMap.width = map.sizeX * 16
    fullMap.height = map.sizeY * 16
    drawMap()

    drawMain()
}

start()