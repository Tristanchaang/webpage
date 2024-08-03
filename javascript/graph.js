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
    clickqueue.push(splitted);
    edgeisclicked = true;
}

function midPoint(coord1,coord2, bend = 0) {
    const a = Number(coord1[0]), b = Number(coord1[1]);
    const c = Number(coord2[0]), d = Number(coord2[1]);
    return [0.5 *a + 0.01 *b*bend - 0.01* bend *d + 0.5* c, -0.01* a*bend + 0.01 *c*bend + 0.5*b + 0.5 *d]
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

let toLoad;

function loadFile() {
    const [file] = document.getElementById("loadFile").files;
    const reader = new FileReader();
  
    reader.addEventListener(
      "load",
      () => {

        adjlist = Object();
        svg.selectAll("g").remove();

        toLoad = reader.result;
        for (const obj of toLoad.split(";")) {
            // console.log(obj);
            let freshobj = obj.split(",");
            if (freshobj[0] == "node") {
                new node(freshobj[1], freshobj[2], freshobj[3]);
            }
        }
        for (const obj of toLoad.split(";")) {
            // console.log(obj);
            let freshobj = obj.split(",");
            if (freshobj[0] == "edge") {
                new edge(["node", freshobj[1],freshobj[2]], ["node", freshobj[3], freshobj[4]], freshobj[5], freshobj[6], freshobj[7]);
            }
        }
      },
      false,
    );
  
    if (file) {
      reader.readAsText(file);
    }
    
  }

function saveFile() {
    toSave = "";
    const visitedEdges = [];

    for (const nodexy of Object.keys(adjlist)) {
        toSave += nodexy + "," + adjlist[nodexy][1] + ";";
        for (const edgeobj of adjlist[nodexy][0]) {
            const edgeid = edgeobj[1].attr("id");
            if (!visitedEdges.includes(edgeid)) {
                toSave += edgeid.split("-").slice(0,5) + "," + edgeid.split("-").slice(6) + ";";
                visitedEdges.push(edgeid);
            }
            
        }
    }

    let element = document.createElement('a');
    let filename = document.getElementById('saveFileName').value
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(toSave));
    element.setAttribute('download', filename+'.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const offset = document.getElementById("toppart").offsetHeight;
const svg = d3.select("body").insert("svg", "#tutorial")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight - offset)
                .attr("style", "top: "+offset+"px; position: fixed;")

svg.append("div").attr("id", "divider");

adjlist = Object() // {"node",x,y: [[neighbours, ...], label], ...}

let nodeColor = 'lightgray';

class node {
    constructor(x, y, label) {
        this.coord = [x,y];
        this.label = label;
        
        adjlist[["node",x,y]] = [[], label];

        const shapegroup = svg.append("g");

        shapegroup.attr("id", "node-"+[x,y].join("-"))
                    .attr("onclick", "nodeClicked(this.id)")
                    .attr("style", "cursor: pointer;")

        shapegroup.append("circle")
                .attr("cx", x).attr("cy", y).attr("r", 25)
                .attr("fill", nodeColor).attr("stroke", "black")
                .attr("stroke-width", 5).attr("class", "nodecircle")

        shapegroup.append("text")
                .text(String(label))
                .attr("x", x).attr("y", y).attr("text-anchor", "middle")
                .attr("dominant-baseline", "central").attr("font-size", 25)
                .attr("font-family", "Arial, Helvetica, sans-serif")
                .attr("font-weight", "bold")
    }
}

let autoedgenumber = 1;

class edge {
    constructor(node1, node2, arrow=0, weight=0, bend=0) {

        // edge representation: ["edge",x1,y1,x2,y2,label, arrow, w, b]
        const thisedge = svg.insert("g", "#divider")
                            .attr("id", "edge-"+node1.slice(1,3).join("-")+"-"+node2.slice(1,3).join("-")+"-"+autoedgenumber+"-"+arrow+"-"+weight+"-"+bend)
                            .attr("onclick", "edgeClicked(this.id)")
                            .attr("style", "cursor: pointer;")
        autoedgenumber++;
        
        adjlist[node1][0].push([node2, thisedge]);

        if (arrow==0) {adjlist[node2][0].push([node1, thisedge])};

        const midpoint = midPoint(node1.slice(1,3), node2.slice(1,3), bend)

        thisedge.append("path")
            .attr("style", "fill:none; stroke:black; stroke-width:10;")
            .attr("d", "M " + node1[1] + " " + node1[2] 
            + " Q " + midpoint[0] + " " + midpoint[1] 
            + " " + node2[1] + " " + node2[2] 
            + "")
            .attr("class", "edgepath")
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

        let arrow=0, weight=0, bend=0;
        for (const parsed of inputstatus.split(",")) {
            if (parsed=="dir") arrow=1;
            if (parsed.slice(0,2)=="w=") weight=Number(parsed.slice(2));
            if (parsed.slice(0,2)=="b=") bend=Number(parsed.slice(2));
        }

        for (let i=0; i<clickqueue.length-1; i++) {
            if (clickqueue[i][0] === "node" && clickqueue[i+1][0] === "node") {
                new edge(clickqueue[i], clickqueue[i+1], arrow, weight, bend)
            }
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

        if (curobj[0] === "edge") {
            for (const nodetrip of Object.keys(adjlist)) {
                adjlist[nodetrip][0] = adjlist[nodetrip][0].filter((nodeedge) => {
                    return !(nodeedge[1].attr("id") === curobj.join("-"))
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



function setNodeColor(color) {
    d3.selectAll(".nodeColor").attr("class", "selector nodeColor off");
    d3.select("#nodeColor-"+color).attr("class", "selector nodeColor on");
    nodeColor = color;
    d3.selectAll(".nodecircle").style("fill", color)
}

const defaultNodeColor = "lightgray"

const nodeColorOptions = [
    defaultNodeColor,
    "pink",
    "lightblue",
    "lightgreen",
    "white",
]

for (const color of nodeColorOptions) {
    d3.select("#nodeColorOptions")
        .append("button")
        .attr("style", "background-color: " + color + ";")
        .attr("class", "selector nodeColor off")
        .attr("id", "nodeColor-"+color)
        .attr("onclick", "setNodeColor('"+color+"')")
        .text("\xa0")
}

d3.select("#nodeColor-"+defaultNodeColor).attr("class", "selector nodeColor on")


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
