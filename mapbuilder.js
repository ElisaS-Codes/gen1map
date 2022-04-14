const clickDrawiTile = (id) => {
    mapstate = 'placing'
    tiletemp = id
}

const createImageElement = (id) => {
    const element = document.createElement("canvas")
    element.width = 32
    element.height = 32
    const elementCtx = element.getContext("2d")
    
    elementCtx.drawImage(
        tileset,
        (id % 10) * 16, Math.trunc(id / 10) * 16, 16, 16,
        0, 0, 32, 32
    )

    element.onclick = (() => clickDrawiTile(id))

    return element
}

const editMap = (x,y,newTile) =>{

    let chunk = calculateSourceChunk(x,y)

    if (chunk){

        chunk.array[(x - chunk.startX) + (y - chunk.startY) * chunk.sizeX] = newTile

        redrawChunk(chunk)
    }
}

const squarePaint = (firstPos, secondPos, newTile) => {
    let startx = (firstPos[0] < secondPos[0]) ? firstPos[0] + 1 : secondPos[0] + 1
    let starty = (firstPos[1] < secondPos[1]) ? firstPos[1] : secondPos[1]
    let rows = Math.abs(firstPos[0] - secondPos[0]) + 1
    let cols = Math.abs(firstPos[1] - secondPos[1]) + 1

    let chunk = calculateSourceChunk(firstPos[0],firstPos[1])

    for( j = 0; j < cols; j++){
        for( i = 0; i < rows; i++){
            chunk.array[(startx -1 + i - chunk.startX) + (starty + j - chunk.startY) * chunk.sizeX] = newTile
        }
    }

    redrawChunk(chunk)
}

const populateDrawSidebar =() => {
    for(var i = 0; i < 100; i++){
        sidebar.appendChild(createImageElement(i))
    }
}