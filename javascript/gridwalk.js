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
    
    const [rows, cols] = gameLevel.size;

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