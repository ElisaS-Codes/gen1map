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

const downloadMap = () => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map));
    var dlAnchorElem = document.getElementById('mapDownload');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "map.json");
    dlAnchorElem.click();
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
    scale += event.deltaY * 0.0005 

    if (scale < 0.1) {
        scale = 0.1
        return
    }

    cameraPos[0] -= event.deltaY * 0.0005 * mainC.width / 2
    cameraPos[1] -= event.deltaY * 0.0005 * mainC.height / 2

    drawMain()
}

const onMouseDown = (event) => {
    event.preventDefault()
    
    if (mapstate === 'waiting'){
        mapstate = 'drag'
        dragtemp = [event.x, event.y]
    } else if (mapstate === 'placing') {
        let [x, y] = calculateClickedTile(event.offsetX, event.offsetY)
        editMap(x, y, tiletemp)
    }
    
}

const onMouseUp = (event) => {
    event.preventDefault()
    if (mapstate === 'drag'){
        mapstate = 'waiting'
    } else if (mapstate === 'placing' && !event.shiftKey){
        mapstate = 'waiting'
    }
    
}

const onMouseMove = (event) => {
    event.preventDefault()
    if (mapstate != 'drag') return
    cameraPos = [cameraPos[0] + (dragtemp[0] - event.x) * scale, cameraPos[1] + (dragtemp[1] - event.y) * scale]
    dragtemp = [event.x, event.y]
    drawMain()
}

const onMouseLeave = (event) => {
    mapstate = 'waiting'
}

const calculateClickedTile = (x,y) => {
    let mapX = Math.trunc((x * scale + cameraPos[0]) / 16)
    let mapY = Math.trunc((y * scale + cameraPos[1]) / 16)

    mapX = Object.is(mapX,-0) ? -1 : mapX
    mapY = Object.is(mapY,-0) ? -1 : mapY

    //console.log(mapX,mapY);
    return [mapX,mapY]
}

const calculateSourceChunk = (x,y) => {

    for(chunk of map.chunks){
        if ((x >= chunk.startX && x <= chunk.startX + chunk.sizeX - 1) && (y >= chunk.startY && y <= chunk.startY + chunk.sizeY - 1)){
            //console.log(chunk.name);
            return chunk
        }
    }
    //console.log("OOB");
    return null
}

//DRAW
const drawMapChunk = (chunk) => {

    const chunkImg = document.createElement("canvas")
    const chunkImgCtx = chunkImg.getContext("2d")
    chunkImg.width = chunk.sizeX * 16
    chunkImg.height = chunk.sizeY * 16

    for (let i = 0 ; i < chunk.array.length; i++) {

        chunkImgCtx.drawImage(
            tileMap,
            (chunk.array[i] % 10) * 16, Math.trunc(chunk.array[i] / 10) * 16, 16, 16,
            i % chunk.sizeX * 16, Math.trunc(i/chunk.sizeX) * 16, 16 , 16
        )
    }

    if (chunk.pallete != 'bw') {

        const tempImgData = chunkImgCtx.getImageData(0,0,chunkImg.width,chunkImg.height)
        const tempData = tempImgData.data

        for (var i = 0; i < tempData.length; i += 4) {
            
            if (tempData[i] === 248) { //white
                tempData[i] = palletArray[chunk.pallete][0][0]
                tempData[i+1] = palletArray[chunk.pallete][0][1]
                tempData[i+2] = palletArray[chunk.pallete][0][2]
            } else if (tempData[i] === 168) { //light gray
                tempData[i] = palletArray[chunk.pallete][1][0]
                tempData[i+1] = palletArray[chunk.pallete][1][1]
                tempData[i+2] = palletArray[chunk.pallete][1][2]
            } else if (tempData[i] === 96) { //dark gray
                tempData[i] = palletArray[chunk.pallete][2][0]
                tempData[i+1] = palletArray[chunk.pallete][2][1]
                tempData[i+2] = palletArray[chunk.pallete][2][2]
            } else if (tempData[i] === 0) { //black
                tempData[i] = palletArray[chunk.pallete][3][0]
                tempData[i+1] = palletArray[chunk.pallete][3][1]
                tempData[i+2] = palletArray[chunk.pallete][3][2]
            }
        }

        chunkImgCtx.putImageData(tempImgData,0,0)
    }

    return chunkImg
}

const redrawChunk = (chunk) => {
    fullMapCtx.clearRect(
        chunk.startX * 16, chunk.startY * 16,
        chunk.sizeY, chunk.sizeX);

    fullMapCtx.drawImage(drawMapChunk(chunk),
    chunk.startX * 16, chunk.startY * 16)

    drawMain()
}

const drawMap = () => {
    fullMap.width = map.sizeX * 16
    fullMap.height = map.sizeY * 16

    for(chunk of map.chunks){
        fullMapCtx.drawImage(drawMapChunk(chunk),
        chunk.startX * 16, chunk.startY * 16)
    }
}

const drawMain = () => {

    mainCCtx.clearRect(0, 0, mainC.width, mainC.height);

    mainCCtx.drawImage(fullMap,
        cameraPos[0], cameraPos[1],
        mainC.width * scale, mainC.height * scale,
        0, 0,
        mainC.width, mainC.height
    )
}

//Globals
let tileMap, map, palletArray
let cameraPos = [0,0]
let scale = 1

let mapstate = 'waiting'
let tiletemp = 1
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

const sidebar = document.getElementById('sidebar')

async function start() {
    tileMap = loadImage("resources/tilemapRed.png")
    map = await loadJSon("resources/map.json")
    palletArray = await loadJSon("resources/pallete.json")
    areas = await loadJSon("resources/areas.json")

    fullMap.width = map.sizeX * 16
    fullMap.height = map.sizeY * 16
    drawMap()
    populateDrawSidebar()

    drawMain()
}

start()