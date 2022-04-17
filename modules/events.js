let viewportState = 'waiting'
let tempPos = [0,0]

const statMapCoord = document.getElementById('statMapCoord')
const statChunk = document.getElementById('statChunk')
const statChunkCoord = document.getElementById('statChunkCoord')
const statContent = document.getElementById('statcontent')
const scaleShow = document.getElementById('scaleShow')

const keyPress = (event) => {

    switch (event.key){
        case "ArrowUp":
            if (viewportState != 'interior'){
                viewportPos[1] -= 10 * viewportScale
            } else {
                interiorPos[1] -= 10 * interiorScale
            }
            break
        case "ArrowDown":
            if (viewportState != 'interior'){
                viewportPos[1] += 10 * viewportScale
            } else {
                interiorPos[1] += 10 * interiorScale
            }
            break
        case "ArrowLeft":
            if (viewportState != 'interior'){
                viewportPos[0] -= 10 * viewportScale
            } else {
                interiorPos[0] -= 10 * interiorScale
            }
            break
        case "ArrowRight":
            if (viewportState != 'interior'){
                viewportPos[0] += 10 * viewportScale
            } else {
                interiorPos[0] += 10 * interiorScale
            }
            break
        case "Escape":
            viewportState = 'waiting'
            break
        case "F4":
            enableEditor()
            break
    }

    drawViewport()
}

const wheelScroll = (event) => {

    mod = event.deltaY > 0 ? 0.1 : -0.1

    if (viewportState != 'interior'){
        viewportScale += mod
        
        if (viewportScale < 0.1) {
            viewportScale = 0.1
            return
        }

        viewportPos[0] -= mod * viewport.width / 2
        viewportPos[1] -= mod * viewport.height / 2
    } else {
        interiorScale += mod

        if (interiorScale < 0.1) {
            interiorScale = 0.1
            return
        }

        interiorPos[0] -= mod / 2
        interiorPos[1] -= mod / 2
    }

    scaleShow.innerHTML = Math.round((1 / viewportScale)*100)/100 + "X"

    drawViewport()
}

const onMouseDown = (event) => {
    event.preventDefault()

    const tempCoords = calculateClickedTile(event.offsetX, event.offsetY)
    const sourceChunk = calculateSourceChunk(tempCoords[0],tempCoords[1])
    
    if (viewportState === 'waiting'){
        viewportState = 'drag'
        tempPos = [event.x, event.y]
    } else if (viewportState === 'placing'){
        editMap(tempCoords[0], tempCoords[1], tiletemp)
        viewportState = 'placingdrag'
        tempPos = [event.x, event.y]
    } else if (viewportState === 'interior'){
        viewportState = 'interiordrag'
        tempPos = [event.x, event.y]
        if ((tempCoords[0] > -1 && tempCoords[0] < interiorSize[0])
         && (tempCoords[1] > -1 && tempCoords[0] < interiorSize[0])){
            updateStat(tempCoords, sourceChunk)
        } else {
            viewportState = 'waiting'
            instanceChunk = null
            drawViewport()
        }   
    }
    updateStat(tempCoords, sourceChunk)
}

const onMouseUp = (event) => {
    event.preventDefault()

    const tempCoords = calculateClickedTile(event.offsetX, event.offsetY)
    const sourceChunk = calculateSourceChunk(tempCoords[0],tempCoords[1])

    if (viewportState === 'drag'){
        viewportState = 'waiting'
    } else if (viewportState === 'placingdrag'){
        squarePaint(tempPos, calculateClickedTile(event.offsetX, event.offsetY), tiletemp)
        viewportState = 'waiting'
    } else if (viewportState === 'interiordrag'){
        viewportState = 'interior'
        drawViewport()
    }

    if (sourceChunk) {
        for(interior of sourceChunk.interiors){
            if ((interior.x == tempCoords[0] - sourceChunk.startX) && (interior.y == tempCoords[1] - sourceChunk.startY)){
                if (viewportState == 'interior') break
                viewportState = 'interior'
                drawInterior(interior.instance)
                drawViewport()
                break
            }
        }
    }
}

const onMouseMove = (event) => {
    event.preventDefault()
    if (viewportState == 'drag'){
        viewportPos = [viewportPos[0] + (tempPos[0] - event.x) * viewportScale, viewportPos[1] + (tempPos[1] - event.y) * viewportScale]
        tempPos = [event.x, event.y]
    } else if (viewportState == 'interiordrag') {
        interiorPos = [interiorPos[0] - (tempPos[0] - event.x), interiorPos[1] - (tempPos[1] - event.y)]
        tempPos = [event.x, event.y]
    }
    drawViewport()
}

const onMouseLeave = (event) => {
    if (viewportState == 'drag')
        viewportState = 'waiting'
}

const changeGame = (gameChar) => { //TODO: implement game changing
    return
}

const calculateClickedTile = (x,y) => {
    let mapX, mapY

    if (viewportState != 'interior'){
        mapX = Math.trunc((x * viewportScale + viewportPos[0]) / 16)
        mapY = Math.trunc((y * viewportScale + viewportPos[1]) / 16)

        mapX = Object.is(mapX, -0) ? -1 : mapX // i have to handle negative zeroes
        mapY = Object.is(mapY, -0) ? -1 : mapY // :holdsheadandcryesemoji:
    } else {
        mapX = Math.trunc((x - ((viewport.width - interiorMap.width * interiorScale) / 2) - interiorPos[0]) / interiorScale /16)
        mapY = Math.trunc((y - ((viewport.height - interiorMap.height * interiorScale) / 2) - interiorPos[1]) / interiorScale /16)

        mapX = Object.is(mapX, -0) ? -1 : mapX // i have to handle negative zeroes
        mapY = Object.is(mapY, -0) ? -1 : mapY // :holdsheadandcryesemoji:
    }

    return [mapX,mapY]
}

const calculateSourceChunk = (x,y) => {

    if (viewportState != 'interior'){
        for(chunk of mapObj.chunks){
            if ((x >= chunk.startX && x <= chunk.startX + chunk.sizeX - 1) && (y >= chunk.startY && y <= chunk.startY + chunk.sizeY - 1)){
                return chunk
            }
        }
    } else {
        return instanceChunk
    }
    return null
}

const updateStat = (mapCoords, chunk) => {
    let chunkCoords, chunkName, tempstats = ""

    if (chunk) {
        if (viewportState != 'interiordrag'){
            chunkCoords = [mapCoords[0] - chunk.startX, mapCoords[1] - chunk.startY]
        } else {
            chunkCoords = mapCoords
        }
        chunkName = chunk.name

        for (i of chunk.signs) {
            if (i.x === chunkCoords[0] && i.y === chunkCoords[1]){
                tempstats += "<p>Sign: " + i.text + "</p>"
            }
        }

        for (i of chunk.items) {
            if (i.x === chunkCoords[0] && i.y === chunkCoords[1]){
                tempstats += "<p>ITEM: " + i.item + "</p>"
                break
            }
        }
        
        for (i of chunk.npc) {
            if (i.x === chunkCoords[0] && i.y === chunkCoords[1]){
                if (i.name)
                    tempstats += "<p>Name: " + i.name + "</p>"

                tempstats += "<p>First Dialogue: " + i.text + "</p>"

                if (i.item)
                    if (i.item.length == 1){
                        tempstats += "<p>Gives Item: " + i.item[0].item + "</p>"
                    } else {
                        tempstats += "<p>Items for sale:<ul>"
                        for (it of i.item) {
                            tempstats += "<li>" + it.item + " - price:" + it.other + "</li>"
                        }
                        tempstats += "</ul></p>"    
                    }
                    
                
                if (i.trainer){
                    tempstats += "<p>Pokemons:<ul>"
                    for (pk of i.trainer) {
                        tempstats += "<li>" + pk.species + " - LVL:" + pk.lvl + "</li>"
                    }
                    tempstats += "</ul></p>"
                }

                if (i.loss)
                    tempstats += "<p>Loss quote: " + i.loss + "</p>"
                
                if (i.price)
                    tempstats += "<p>Win Price: " + i.price + "</p>"

                if (i.text2)
                    tempstats += "<p>Second Dialogue: " + i.text2 + "</p>"
                break
            }
        }

        if (chunk.grass){
            for (i of chunk.grass) {
                if (((chunkCoords[0] >= i[0] && chunkCoords[0] <= i[2]) && (chunkCoords[1] >= i[1] && chunkCoords[1] <= i[3]))){
                    tempstats += "<p>Grass Encounters: <ul>"
                    for( enc of chunk.grassencounters) {
                        tempstats += "<li>" + enc.pokemon + " - " + enc.levels + " - " + enc.rate + "</li>"
                    }
                    tempstats += "</ul></p>"
                    break
                }
            }
        }

        if (chunk.water){
            for (i of chunk.water) {
                if (((chunkCoords[0] >= i[0] && chunkCoords[0] <= i[2]) && (chunkCoords[1] >= i[1] && chunkCoords[1] <= i[3]))){
                    if (chunk.waterencounters != []){
                        tempstats += "<p>Surfing Encounters: <ul>"
                        for( enc of chunk.waterencounters) {
                            tempstats += "<li>" + enc.pokemon + " - " + enc.levels + " - " + enc.rate + "</li>"
                        }
                        tempstats += "</ul></p>"
                    }
                    if (chunk.fishing != []){
                        tempstats += "<p>Fishing Encounters: <ul>"
                        for( enc of chunk.fishing) {
                            tempstats += "<li>" + enc.pokemon + " - " + enc.levels + " - " + enc.rate + "</li>"
                        }
                        tempstats += "</ul></p>"
                    }
                    break
                }
            }    
        }
    } else {
        chunkCoords = [0,0]
        chunkName = "Out of Bounds"
        tempstats = ""
    }

    statMapCoord.innerHTML = mapCoords[0] + ";" + mapCoords[1]
    statChunk.innerHTML = chunkName
    statChunkCoord.innerHTML = chunkCoords[0] + ";" + chunkCoords[1]
    statContent.innerHTML = tempstats
    
}