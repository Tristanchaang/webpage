const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const canvas = d3.select("body")
                    .append("svg")
                    .attr("width", screenWidth)
                    .attr("height", screenHeight)
                    .style("position", "fixed");

gameLevel = {
    size: [3,4],
    wall: []
};

const squareSide = 100;


function createLevel(gameLevel) {
    canvas.selectAll("*").remove()
    
    const levelBackground = canvas.append("g").attr("class", "levelBackground")
    
    const [cols, rows] = gameLevel.size;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            levelBackground.append("rect")
                            .attr("x", (screenWidth-cols*squareSide)/2 + squareSide * x)
                            .attr("y", (screenHeight-rows*squareSide)/2 + squareSide * y)
                            .attr("width", squareSide).attr("height", squareSide)
                            .style("fill", "none").style("stroke", "black").style("stroke-width", "5px");
        }
    }

    const player = canvas.append("g").attr("class", "player")

    player.append("circle")
        .attr("cx", (screenWidth-cols*squareSide)/2 + squareSide/2)
        .attr("cy", (screenHeight-rows*squareSide)/2 + squareSide/2)
        .attr("r", squareSide*0.3)
        .attr("fill", "lime").attr("stroke", "green")
        .attr("stroke-width", 5).attr("class", "playerNode");
}

function oneStep(tile, direction) {
    
    const [cols, rows] = gameLevel.size;
    const minX = (screenWidth-cols*squareSide)/2 + 0.5*squareSide;
    const minY = (screenHeight-rows*squareSide)/2 + 0.5*squareSide;
    const maxX = (screenWidth-cols*squareSide)/2 + (cols-0.5)*squareSide;
    const maxY = (screenHeight-rows*squareSide)/2 + (rows-0.5)*squareSide;
    switch (direction) {
        case "U": return [tile[0],Math.max(minY,Number(tile[1])-squareSide)];
        case "D": return [tile[0],Math.min(maxY,Number(tile[1])+squareSide)];
        case "L": return [Math.max(minX,Number(tile[0])-squareSide),tile[1]];
        case "R": return [Math.min(maxX,Number(tile[0])+squareSide),tile[1]];
    }
    
}


function movePlayer(direction) {
    targetHTML = d3.select(".playerNode")
    const [newx, newy] = oneStep([targetHTML.attr("cx"),targetHTML.attr("cy")], direction)
    targetHTML.attr("cx", newx).attr("cy", newy)
}

d3.select("body").on('keydown', (event) => {
    let direction;
    switch (event.key) {
        case "ArrowUp": direction = "U"; break;
        case "ArrowDown": direction = "D"; break;
        case "ArrowLeft": direction = "L"; break;
        case "ArrowRight": direction = "R"; break;
        default: return
    }
    movePlayer(direction);
})


createLevel(gameLevel)

function animate(delay, duration, func) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= duration) {t.stop();}
        }, delay)
}


let breathing = true
animate(0, Infinity,
    (elapsed) => {
        if (breathing) {
            d3.selectAll(".playerNode")
                .attr("r", 0.3*squareSide + 2.5*Math.sin(elapsed/500));
                
        } else {
            d3.selectAll(".playerNode")
                .attr("r", 0.3*squareSide);
        }
    }
)