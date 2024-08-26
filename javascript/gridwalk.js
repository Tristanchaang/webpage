const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const squareSide = 100;
let gameStatus = "o";

const canvas = d3.select("body")
                    .append("svg")
                    .attr("width", screenWidth)
                    .attr("height", screenHeight)
                    .style("position", "fixed");

for (const [l,t,code,dir] of [["130px","210px","&#9650;","U"],["210px","130px","&#9664;","L"],
                            ["50px","130px","&#9654;","R"],["130px","50px","&#9660;","D"]]) {
    d3.select("body").append("button")
        .style("right", l)
        .style("bottom", t)
        .attr("onclick", "directionPressed('" + dir + "')")
        .attr("class", "controller")
        .html(code)
}
d3.select("body").append("dir").text("(or use arrow keys)")
    .style("position", "fixed")
    .style("align", "right")
    .style("padding-right", "50px")
    .style("bottom", "100px")
    .style("font-family", "arial")
    .style("font-size", "25px")

let gameLevels = [
    {
        size: [8,4],
        wall: [
            "01111111",
            "01111111",
            "01111111",
            "00000000"
            ], 
        start: [0,3],
        end: [7,3],
        adversary: [0,0]
    },
    {
        size: [8,5],
        wall: [
            "11000001",
            "11011101",
            "00011100",
            "11011101",
            "11000001"  
            ],
        start: [0,2],
        end: [7,2],
        adversary: [5,4]
    },
    {
        size: [8,5],
        wall: [
            "01100000",
            "00000011",
            "00000000",
            "11100000",
            "11100000"
        ],
        start: [0,0],
        end: [7,0],
        adversary: [7,4]
    },
    {
        size: [8,6],
        wall: [
            "01100010",
            "00101000",
            "10001111",
            "11100000",
            "10001110",
            "10000000"
        ],
        start: [0,0],
        end: [7,0],
        adversary: [7,5]
    },
];

for (let k = 1; k < 8; k++) {
    for (let l = 0; l < 3; l++) {
        gameLevels[0].wall.push(k+"-"+l);
    }
}

let levelNum = 0;

let playerTile, adversaryTile, adjList;

function isFree(tile) {
    return (0 <= tile[0] && tile[0] < gameLevels[levelNum].size[0] && 
        0 <= tile[1] && tile[1] < gameLevels[levelNum].size[1] && 
        !(gameLevels[levelNum].wall[tile[1]][tile[0]] == "1"))
}

function createLevel(gameLevel) {
    canvas.selectAll("*").remove()

    gameStatus = "o";

    playerTile = gameLevel.start;
    adversaryTile = gameLevel.adversary;
    adjList = {};
    
    const levelBackground = canvas.insert("g", ".controller").attr("class", "levelBackground")
    
    const [cols, rows] = gameLevel.size;

    let square;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            adjList[[x,y].join("-")] = [];

            // draw map
            square = levelBackground.append("rect")
                            .attr("x", (screenWidth-cols*squareSide)/2 + squareSide * x)
                            .attr("y", (screenHeight-rows*squareSide)/2 + squareSide * y)
                            .attr("width", squareSide).attr("height", squareSide)
                            .style("stroke", "black").style("stroke-width", "5px");
            if (gameLevel.wall[y][x] == "1") square.style("fill", "black");
            else if ([x,y].join("-") == gameLevel.start.join("-")) square.style("fill", "turquoise");
            else if ([x,y].join("-") == gameLevel.end.join("-")) square.style("fill", "palegreen");
            else square.style("fill", "none");

            // build adjacency list
            for (const nb of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
                if (isFree(nb)) adjList[[x,y].join("-")].push(nb.join("-"))
            }
        }
    }

    const player = canvas.append("g").attr("class", "player")

    const [xPlayer, yPlayer] = intToCoord(playerTile);
    player.append("circle")
        .attr("cx", xPlayer)
        .attr("cy", yPlayer)
        .attr("r", squareSide*0.3)
        .attr("fill", "lime").attr("stroke", "green")
        .attr("stroke-width", 5).attr("class", "node").attr("id", "playerNode");

    const adversary = canvas.append("g").attr("class", "adversary")

    const [xAdversary, yAdversary] = intToCoord(adversaryTile);
    adversary.append("circle")
        .attr("cx", xAdversary)
        .attr("cy", yAdversary)
        .attr("r", squareSide*0.3)
        .attr("fill", "pink").attr("stroke", "red")
        .attr("stroke-width", 5).attr("class", "node").attr("id", "adversaryNode");
}

function intToCoord(tile) {
    const [cols, rows] = gameLevels[levelNum].size
    return [(screenWidth-(cols-1)*squareSide)/2 + squareSide*tile[0], 
            (screenHeight-(rows-1)*squareSide)/2 + squareSide*tile[1]]
}

function oneStep(tile, direction) {
    
    const [cols, rows] = gameLevels[levelNum].size;
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
    const [newx, newy] = intToCoord(playerTile);
    d3.select("#playerNode").attr("cx", newx).attr("cy", newy);
    
    if (playerTile.join("-") == gameLevels[levelNum].end.join("-")) endGame(true);
}

function moveAdversary() {
    const terminal = playerTile.join("-");
    const source = adversaryTile.join("-");
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
    
    
    const curcur = intToCoord(cur.split("-"));
    d3.select("#adversaryNode").attr("cx", curcur[0]).attr("cy", curcur[1]);
}

function directionPressed(direction) {
    if (gameStatus == "o") {

        // player's turn
        movePlayer(direction);
        if (playerTile.join("-") == adversaryTile.join("-")) {
            endGame(false);
            return;
        }

        // adversary's turn
        moveAdversary();
        if (playerTile.join("-") == adversaryTile.join("-")) {
            endGame(false);
            return;
        }
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

createLevel(gameLevels[levelNum])

let flickerPeriod = 500;

function endGame(status) {
    if (status) {
        gameStatus = "w";
        animate(0, 2800,
            (elapsed) => {
                d3.select("body").style("background-color", (elapsed%(flickerPeriod) < flickerPeriod/2)?"palegreen":"white");
            }
        )
        
        setTimeout(function() {
            d3.select("body").style("background-color", "white")
            levelNum += 1;
            levelNum < gameLevels.length ? createLevel(gameLevels[levelNum]) : thankYou();
          }, 3000)
    }
    else {
        gameStatus = "l";
        animate(0, 2800,
            (elapsed) => {
                d3.select("body").style("background-color", (elapsed%(flickerPeriod) < flickerPeriod/2)?"pink":"white");
            }
        )
        d3.select("body").style("background-color", "white")
        setTimeout(function() {;
            d3.select("body").style("background-color", "white")
            createLevel(gameLevels[levelNum]);
          }, 3000)
    }
}

function animate(delay, duration, func) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= delay+duration) {t.stop();}
        }, delay)
}


function thankYou() {
    canvas.selectAll("*").remove()
    gameStatus = "e"
    canvas.append("text").text("thx for playing")
    .attr("x", screenWidth/2)
    .attr("y", screenHeight/2 - 40)
    .style("font", "80px arial")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "central");
    canvas.append("text").text("reload to restart lol")
    .attr("x", screenWidth/2)
    .attr("y", screenHeight/2 + 40)
    .style("font", "50px arial")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "central");
}

let breathing = true;
animate(0, Infinity,
    (elapsed) => {
        if (breathing) {
            d3.selectAll(".node")
                .attr("r", 0.3*squareSide + 2.5*Math.sin(elapsed/500));
                
        } else {
            d3.selectAll(".node")
                .attr("r", 0.3*squareSide);
        }

    }
)

let winningPositions = []
let losingPositions = []
let freeTiles = []

function buildStrategies() {
    winningPositions = []
    losingPositions = []
    freeTiles = []
    const [cols, rows] = gameLevels[levelNum].size

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (gameLevels[levelNum].wall[y][x] == "0") freeTiles.push([x,y]);
        }
    }

    console.log(freeTiles)
}

function winOrLose(playerTile, adversaryTile, turn) {
    if (turn != "A" && turn != "P") return;
    if (playerTile == gameLevels[levelNum].end && turn == "P") return true;
}