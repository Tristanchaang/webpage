const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const squareSide = 100;
let gameStatus = "o";

const canvas = d3.select("body")
                    .append("svg")
                    .attr("width", screenWidth)
                    .attr("height", screenHeight)
                    .style("position", "fixed");

for (const [l,t,code,dir] of [["100px","50px","&#9650;","U"],["50px","100px","&#9664;","L"],
                            ["150px","100px","&#9654;","R"],["100px","150px","&#9660;","D"]]) {
    d3.select("body").append("button")
        .style("border", "2px outset black")
        .style("background-color", "gray")
        .style("height", "50px")
        .style("width", "50px")
        .style("left", l)
        .style("top", t)
        .style("position", "fixed")
        .style("cursor", "pointer")
        .style("font-size", "30px")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
        .attr("onclick", "directionPressed('" + dir + "')")
        .html(code)
}
d3.select("body").append("dir").text("or use arrow keys")
    .style("position", "fixed")
    .style("padding-left", "50px")
    .style("top", "200px")
    .style("font-family", "arial")
    .style("font-size", "20px")

let gameLevel = {
    size: [8,5],
    wall: ["1-0", "4-3", "0-3", "1-3", "2-4", "3-3"],
    start: [0,0],
    end: [7,0]
};

let adjList = {};

let playerTile = gameLevel.start;
let adversaryTile = [gameLevel.size[0]-1, gameLevel.size[1]-1];

function isFree(tile) {
    return (0 <= tile[0] && tile[0] < gameLevel.size[0] && 0 <= tile[1] && tile[1] < gameLevel.size[1] && !(gameLevel.wall.includes(tile.join("-"))))
}

function createLevel(gameLevel) {
    canvas.selectAll("*").remove()
    
    const levelBackground = canvas.append("g").attr("class", "levelBackground")
    
    const [cols, rows] = gameLevel.size;

    let square;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            adjList[[x,y].join("-")] = [];
            square = levelBackground.append("rect")
                            .attr("x", (screenWidth-cols*squareSide)/2 + squareSide * x)
                            .attr("y", (screenHeight-rows*squareSide)/2 + squareSide * y)
                            .attr("width", squareSide).attr("height", squareSide)
                            .style("stroke", "black").style("stroke-width", "5px");
            if (gameLevel.wall.includes([x,y].join("-"))) square.style("fill", "black");
            else if ([x,y].join("-") == gameLevel.start.join("-")) square.style("fill", "palegreen");
            else if ([x,y].join("-") == gameLevel.end.join("-")) square.style("fill", "turquoise");
            else square.style("fill", "none");

            for (const nb of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
                if (isFree(nb)) adjList[[x,y].join("-")].push(nb.join("-"))
            }
        }
    }

    const player = canvas.append("g").attr("class", "player")

    const [xPlayer, yPlayer] = realize(playerTile);
    player.append("circle")
        .attr("cx", xPlayer)
        .attr("cy", yPlayer)
        .attr("r", squareSide*0.3)
        .attr("fill", "lime").attr("stroke", "green")
        .attr("stroke-width", 5).attr("class", "node").attr("id", "playerNode");

    const adversary = canvas.append("g").attr("class", "adversary")

    const [xAdversary, yAdversary] = realize(adversaryTile);
    adversary.append("circle")
        .attr("cx", xAdversary)
        .attr("cy", yAdversary)
        .attr("r", squareSide*0.3)
        .attr("fill", "pink").attr("stroke", "red")
        .attr("stroke-width", 5).attr("class", "node").attr("id", "adversaryNode");
}

function realize(tile) {
    const [cols, rows] = gameLevel.size
    return [(screenWidth-(cols-1)*squareSide)/2 + squareSide*tile[0], 
            (screenHeight-(rows-1)*squareSide)/2 + squareSide*tile[1]]
}

function oneStep(tile, direction) {
    
    const [cols, rows] = gameLevel.size;
    let raw;
    switch (direction) {
        case "U": raw = [tile[0],Number(tile[1])-1]; break;
        case "D": raw = [tile[0],Number(tile[1])+1]; break;
        case "L": raw = [Number(tile[0])-1,tile[1]]; break;
        case "R": raw = [Number(tile[0])+1,tile[1]]; break;
        default: return;
    }
    return (isFree(raw) ? raw : tile);
}


function movePlayer(direction) {
    playerTile = oneStep(playerTile, direction);
    const [newx, newy] = realize(playerTile);
    d3.select("#playerNode").attr("cx", newx).attr("cy", newy);
    if (playerTile.join("-") == gameLevel.end.join("-")) gameStatus = "w";
}

function moveAdversary() {
    const terminal = playerTile.join("-");
    const source = adversaryTile.join("-");

    if (terminal == source) {
        endGame(false);
        return
    }

    const visited = [source];
    const levels = [[source]];
    const parents = {};

    parents[source] = null;

    cur_level = 0;
    while (true) {
        levels.push([]);
        if (levels[cur_level].length == 0) {break}
        for (const v of levels[cur_level]) {
            for (const nb of adjList[v]) {
                if (!visited.includes(nb)) {
                    visited.push(nb)
                    parents[nb] = v;
                    levels[cur_level+1].push(nb)
                }
            }
                
        }
        cur_level++;
    }

    let cur = terminal;

    while (parents[cur] != source) {
        cur = parents[cur]
    }
    adversaryTile = cur.split("-");
    
    const curcur = realize(cur.split("-"))
    d3.select("#adversaryNode").attr("cx", curcur[0]).attr("cy", curcur[1])
}

function directionPressed(direction) {
    if (gameStatus == "o") {
        movePlayer(direction);
        moveAdversary();
    }
}

d3.select("body").on('keydown', (event) => {
    switch (event.key) {
        case "ArrowUp": directionPressed("U"); break;
        case "ArrowDown": directionPressed("D"); break;
        case "ArrowLeft": directionPressed("L"); break;
        case "ArrowRight": directionPressed("R"); break;
        default: return
    }
})

createLevel(gameLevel)

function endGame(status) {
    if (status) {
        gameStatus = "w";
    }
    else {
        gameStatus = "l";
    }
}

function animate(delay, duration, func) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= duration) {t.stop();}
        }, delay)
}

let flickerPeriod = 500;

let breathing = true
animate(0, Infinity,
    (elapsed) => {
        if (breathing) {
            d3.selectAll(".node")
                .attr("r", 0.3*squareSide + 2.5*Math.sin(elapsed/500));
                
        } else {
            d3.selectAll(".node")
                .attr("r", 0.3*squareSide);
        }

        if (gameStatus == "l") {
            d3.select("body").style("background-color", (elapsed%(flickerPeriod) < flickerPeriod/2)?"pink":"white");
        }

        if (gameStatus == "w") {
            d3.select("body").style("background-color", (elapsed%(flickerPeriod) < flickerPeriod/2)?"palegreen":"white");
        }

    }
)