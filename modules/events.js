let mapstate = 'waiting'
let tempPos = [0,0]

const statMapCoord = document.getElementById('statMapCoord')
const statChunk = document.getElementById('statChunk')
const statChunkCoord = document.getElementById('statChunkCoord')
const statTile = document.getElementById('statTile')
const statcontent = document.getElementById('statcontent')
const scaleShow = document.getElementById('scaleShow')

const keyPress = (event) => {

    switch (event.key){
        case "ArrowUp":
            viewportPos[1] += 5
            drawViewport()
            break
        case "ArrowDown":
            viewportPos[1] -= 5
            drawViewport()
            break
        case "ArrowLeft":
            viewportPos[0] += 5
            drawViewport()
            break
        case "ArrowRight":
            viewportPos[0] -= 5
            drawViewport()
            break
        case "Escape":
            mapstate = 'waiting'
            break
        case "F4":
            enableEditor()
            break
    }
}

const wheelScroll = (event) => {

    mod = event.deltaY > 0? 0.1 : -0.1

    viewportScale += mod

    if (viewportScale < 0.1) {
        viewportScale = 0.1
        return
    }

    viewportPos[0] -= mod * viewport.width / 2
    viewportPos[1] -= mod * viewport.height / 2

    scaleShow.innerHTML = Math.round((1 / viewportScale)*100)/100 + "X"

    drawViewport()
}

const onMouseDown = (event) => {
    event.preventDefault()
    
    if (mapstate === 'waiting'){
        mapstate = 'drag'
        tempPos = [event.x, event.y]
    } else if (mapstate === 'placing') {
        let [x, y] = calculateClickedTile(event.offsetX, event.offsetY)
        editMap(x, y, tiletemp)
    } else if (mapstate === 'placingdrag'){
        squarePaint(tempPos, calculateClickedTile(event.offsetX, event.offsetY), tiletemp)
        mapstate = 'waiting'
    }

    try {
        a = calculateClickedTile(event.offsetX, event.offsetY)
        b = calculateSourceChunk(a[0],a[1])
        //console.log(a[0]-b.startX,a[1]-b.startY);
        updateStat(a,b.name,[a[0]-b.startX,a[1]-b.startY])
    } catch {
        
    }
}

const onMouseUp = (event) => {
    event.preventDefault()
    if (mapstate === 'drag'){
        mapstate = 'waiting'
    } else if (mapstate === 'placing' && !event.ctrlKey && !event.shiftKey){
        mapstate = 'waiting'
    } else if (mapstate === 'placing' && event.ctrlKey){
        mapstate = 'placingdrag'
        tempPos = calculateClickedTile(event.offsetX, event.offsetY)
    }
    
}

const onMouseMove = (event) => {
    event.preventDefault()
    if (mapstate != 'drag') return
    viewportPos = [viewportPos[0] + (tempPos[0] - event.x) * viewportScale, viewportPos[1] + (tempPos[1] - event.y) * viewportScale]
    tempPos = [event.x, event.y]
    drawViewport()
}

const onMouseLeave = (event) => {
    mapstate = 'waiting'
}

const changeGame = (gameChar) => {
    return
}

const calculateClickedTile = (x,y) => {
    let mapX = Math.trunc((x * viewportScale + viewportPos[0]) / 16)
    let mapY = Math.trunc((y * viewportScale + viewportPos[1]) / 16)

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

const updateStat = (mapCoords, chunkName, chunkCoords) => {
    statMapCoord.innerHTML = mapCoords[0] + ";" + mapCoords[1]
    statChunk.innerHTML = chunkName
    statChunkCoord.innerHTML = chunkCoords[0] + ";" + chunkCoords[1]
    let chunk = map.chunks.find(i => i.name === chunkName)
    statTile.innerHTML = chunk.array[chunkCoords[1] * chunk.sizeX + chunkCoords[0]]
}