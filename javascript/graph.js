function changeattr(shapelist,prop,val) {
    for (let shape of shapelist) shape.attr(prop, val);
}

function setattrs(shape, dict) {
    for (let [prop, val] of Object.entries(dict)) shape.attr(prop, val);
}

function animate(delay, duration, func) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= duration) {t.stop();}
        }, delay)
}

function nearestMultiple(num, mul) {return Math.round(num/mul) * mul}

let nodeisclicked = false;
function nodeClicked(thisid) {
    // console.log("Node Selected: " + thisid)
    const splitted = thisid.split("-");
    clickqueue.push(["node",Number(splitted[1]),Number(splitted[2])])
    nodeisclicked = true;
}

let edgeisclicked = false;
function edgeClicked(thisid) {
    // console.log("Node Selected: " + thisid)
    const splitted = thisid.split("-");
    clickqueue.push(["edge",Number(splitted[1]),Number(splitted[2]),Number(splitted[3]),Number(splitted[4])])
    edgeisclicked = true;
}

function midPoint(coord1,coord2) {
    return [(Number(coord1[0]) + Number(coord2[0]))/2, 
    (Number(coord1[1]) + Number(coord2[1]))/2];
}


function pressed(key) {
    switch (key) {
        case "Enter": processInput(); break;
        case "Backspace": processDeletion(); break;
    }
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
}

function helpPressed() {
    d3.select("#tutorial").attr("class", "active")
    d3.select("#overlay").attr("class", "active")
}

function closeTutorial() {
    d3.select("#tutorial").attr("class", "")
    d3.select("#overlay").attr("class", "")
}

function settingsPressed() {
    d3.select("#settings").attr("class", "active")
    d3.select("#overlay").attr("class", "active")
}

function closeSettings() {
    d3.select("#settings").attr("class", "")
    d3.select("#overlay").attr("class", "")
}

const offset = document.getElementById("toppart").offsetHeight;
const svg = d3.select("body").insert("svg", "#tutorial");
setattrs(svg, {
    'width': window.innerWidth, 
    'height': window.innerHeight - offset,
    'style': "top: " + offset + "px; position: fixed;",
});
svg.append("div").attr("id", "divider");

adjlist = Object() // {[x,y]: [[neighbours, ...], label], ...}

let nodeColor = 'rgb(200,200,200)';

class node {
    constructor(x, y, label) {
        this.coord = [x,y];
        this.label = label;
        
        adjlist[["node",x,y]] = [[], label];

        const shapegroup = svg.append("g");

        setattrs(shapegroup, {
            "id": "node-"+[x,y].join("-"),
            "onclick": "nodeClicked(this.id)",
            "style": "cursor: pointer;"
        })

        const nodecirc = shapegroup.append("circle")
        setattrs(nodecirc, {
            "cx": x, "cy": y, "r": 25, 
            "fill": nodeColor, 
            "stroke": "black",
            "stroke-width": 5,
            "class": "nodecircle"
        })
        
        const nodelabel = shapegroup.append("text")
        nodelabel.text(String(label))
        setattrs(nodelabel, {
            "x": x, "y": y,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": 25,
            "font-family": "Arial, Helvetica, sans-serif",
            "font-weight": "bold"
        })
    }
}

class edge {
    constructor(node1, node2, label, arrow=false, weight=0, bend=0) {
        this.label = label;
        this.arrow = arrow;
        this.weight = weight;
        this.bend = bend;

        const thisedge = svg.insert("g", "#divider")
                            .attr("id", "edge-"+node1.slice(1,3).join("-")+"-"+node2.slice(1,3).join("-"))
                            .attr("onclick", "edgeClicked(this.id)")
                            .attr("style", "cursor: pointer;")
        
        adjlist[node1][0].push([node2, thisedge]);

        if (!arrow) {adjlist[node2][0].push([node1, thisedge])};

        const midpoint = midPoint(node1.slice(1,3), node2.slice(1,3))


        setattrs(thisedge.append("path"), {
            "style": "fill:none; stroke:black; stroke-width:10;",
            "d": "M " + node1[1] + " " + node1[2] 
            + " Q " + midpoint[0] + " " + midpoint[1] 
            + " " + node2[1] + " " + node2[2] 
            + "",
            "class": "edgepath"
        })
    }
}

let clickqueue = [];
let inputstatus = "";

svg.on('click', (event) => {
    if (!nodeisclicked && !edgeisclicked) {
        clickqueue.push(["empty",nearestMultiple(event.x,50), nearestMultiple(event.y-offset,50)])
    }
    nodeisclicked = false;
    edgeisclicked = false;

    updateToolbarQueue();
    // console.log(clickqueue) // uncomment to show real clickqueue
})

d3.select("body").on('keydown', (event) => {

    if (["Enter", "Escape", "Backspace", "Shift", "Control"].includes(event.key)) {
        pressed(event.key);
    } else {
        inputstatus += event.key;
    }

    d3.select("#inputstatusbox").text(inputstatus);
})

let autonodenumber = 1

function processInput() {

    for (let queueEl of clickqueue) {
        if (queueEl[0] === "empty") {
            let nodename;
            if (inputstatus) {
                nodename = inputstatus;
            } else {
                nodename = autonodenumber++;
            }
            new node(queueEl[1], queueEl[2], nodename);
        }
    }

    if (clickqueue.length === 1 && clickqueue[0][0] === "node") {
        let nodename;
        if (inputstatus) {
            nodename = inputstatus;
        } else {
            nodename = autonodenumber++;
        }
        d3.select("#"+clickqueue[0].join("-")).select("text").text(nodename);
        adjlist[clickqueue[0]][1] = nodename;
    }

    if (clickqueue.length > 1) {
        for (let i=0; i<clickqueue.length-1; i++) {
            if (clickqueue[i][0] === "node" && clickqueue[i+1][0] === "node") {
                new edge(clickqueue[i], clickqueue[i+1], inputstatus)}
        }
    }

    // console.log("adjlist:")
    // for (const thing of Object.keys(adjlist)) {console.log(thing,adjlist[thing]);}
}

function processDeletion() {
    for (const curobj of clickqueue) {
        
        if (curobj[0] === "node") {
            for (const nbedge of adjlist[curobj][0]) {
                nbedge[1].remove();
            }
            delete adjlist[curobj];

            for (const nodetrip of Object.keys(adjlist)) {
                adjlist[nodetrip][0] = adjlist[nodetrip][0].filter((nodeedge) => {
                    return !(nodeedge[0].join("-") === curobj.join("-"))
                })
            }
        }

        d3.select("#"+curobj.join("-")).remove();

    }
}

function updateToolbarQueue() {
    d3.select("#clickqueue").remove() // remove clickqueue html
    queuebox = d3.select("#toolbar") // reinsert new clickqueue html
                .append("div")
                .attr("id", "clickqueue")
                .attr("style", "float: right; margin: 0;")
                .attr("height", 43)
                .attr("width", 43)

    for (const curclick of clickqueue) {

        const elbox = queuebox.insert("svg", "svg")
                            .attr("height", 43).attr("width", 43)
                            .attr("style", "float: right; margin: 0;")

        if (curclick[0] == "empty") {
            for (const drawpath of ["M 16 6 L 6 6 L 6 16", "M 27 37 L 37 37 L 37 27", "M 27 6 L 37 6 L 37 16", "M 6 27 L 6 37 L 16 37"]) {
                elbox.append("path")
                    .attr("d", drawpath)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)
            }
        }

        if (curclick[0] == "node") {
            elbox.append("path")
                .attr("d", ["M 37 6 L 6 37"])
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
            elbox.append("circle")
                .attr("cx", 21.5).attr("cy", 21.5).attr("r", 15)
                .attr("fill", nodeColor)
                .attr("stroke", "black")
                .attr("stroke-width", 3)
        }

        if (curclick[0] == "edge") {
            elbox.append("path")
                .attr("d", ["M 35 8 L 8 35"])
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
            elbox.append("circle")
                .attr("cx", 35).attr("cy", 8).attr("r", 4)
                .attr("fill", "black")
            elbox.append("circle")
                .attr("cx", 8).attr("cy", 35).attr("r", 4)
                .attr("fill", "black")
        }

        elbox.append("animateMotion")
            .attr("path", "m43,0 l -43,0")
            .attr("begin","0s")
            .attr("dur", "0.2s")
            .attr("repeatCount", 1)
    }
}

const N = 5, M = 8;


for (let i = 0; i < N; i++) {
    new node(Math.round(200 + 100 * Math.sin(2 * Math.PI * i / N)), 
    Math.round(200 - 100 * Math.cos(2 * Math.PI * i / N)), "a"+String(i))
}

for (let i = 0; i < M; i++) {
    new node(Math.round(200 + 100 * Math.sin(2 * Math.PI * i / M)), 
    Math.round(500 - 100 * Math.cos(2 * Math.PI * i / M)), "b"+String(i))
}

let breathing = true;

function toggleBreathing() {
    breathing = !breathing;
    d3.select("#toggleBreathing")
        .attr("class", "toggler "+(breathing ? "on" : "off"))
        .text(breathing ? "On" : "Off");
}



function setNodeColor(raw, color) {
    d3.selectAll(".nodeColor").attr("class", "selector nodeColor off");
    d3.select("#nodeColor-"+color).attr("class", "selector nodeColor on");
    nodeColor = raw;
    d3.selectAll(".nodecircle").style("fill", raw)
}

{/* <button style="background-color: rgb(200,200,200);" class="selector nodeColor on" id="nodeColor-gray" onclick="setNodeColor('gray')">&nbsp;</button> */}

const nodeColorOptions = [
    ["rgb(200,200,200)", "gray"],
    ["pink", "pink"],
    ["lightblue", "blue"],
    ["lightgreen", "green"],
    ["white", "white"]
]

for (const colorcolor of nodeColorOptions) {
    d3.select("#nodeColorOptions")
        .append("button")
        .attr("style", "background-color: " + colorcolor[0] + ";")
        .attr("class", "selector nodeColor off")
        .attr("id", "nodeColor-"+colorcolor[1])
        .attr("onclick", "setNodeColor('"+colorcolor[0]+"','"+colorcolor[1]+"')")
        .text("\xa0")
}

d3.select("#nodeColor-gray").attr("class", "selector nodeColor on")


animate(0, Infinity,
    (elapsed) => {
        if (breathing) {
            d3.selectAll(".nodecircle")
                .attr("r",25 + 3*Math.sin(elapsed/500));
            d3.selectAll(".edgepath")
                .attr("style", "fill: none; stroke: black; stroke-width: " + (10 + 2*Math.sin(elapsed/500)) + ";")
        } else {
            d3.selectAll(".nodecircle")
                .attr("r",25);
            d3.selectAll(".edgepath")
                .attr("style", "fill: none; stroke: black; stroke-width: 10;")
        }
    }
)
